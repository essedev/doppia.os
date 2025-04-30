import type { WindowData } from '$lib/stores/windows';
import type { Spring } from 'svelte/motion';
import type { Writable } from 'svelte/store';

// Constants for snap zones
export const SNAP_THRESHOLD = 20;

// Snap types for different snap positions
export enum SnapType {
	NONE = 'none',
	TOP = 'top', // Full screen
	LEFT = 'left', // Left half
	RIGHT = 'right', // Right half
	TOP_LEFT = 'top-left', // Top-left quarter
	TOP_RIGHT = 'top-right', // Top-right quarter
	BOTTOM_LEFT = 'bottom-left', // Bottom-left quarter
	BOTTOM_RIGHT = 'bottom-right' // Bottom-right quarter
}

// Interface for snap preview window data
export interface SnapPreview {
	id: string;
	snapType: SnapType;
	dimensions: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
}

// Snap action: manages window snapping to screen edges and corners
export function snap(
	coords: Spring<{ x: number; y: number }>,
	id: string,
	windowsStore: Writable<WindowData[]>,
	offset: number,
	navHeight: number
) {
	// Store the current snap type for this window
	let currentSnapType: SnapType = SnapType.NONE;

	// Detect if window is being dragged near a snap zone
	function detectSnapZone(
		x: number,
		y: number,
		viewportWidth: number,
		viewportHeight: number
	): SnapType {
		// Calculate edges of the viewport with offset
		const rightEdge = viewportWidth - offset;
		const topEdge = navHeight + offset;
		const bottomEdge = viewportHeight - offset;

		// Get the current window's dimensions
		let windowWidth = 0;
		let windowHeight = 0;

		const unsubscribe = windowsStore.subscribe((windows) => {
			const window = windows.find((w) => w.id === id);
			if (window) {
				windowWidth = window.w;
				windowHeight = window.h;
			}
		});
		unsubscribe();

		// Check corners first (they have priority)
		// Top-left corner
		if (x <= SNAP_THRESHOLD && y <= topEdge + SNAP_THRESHOLD) {
			return SnapType.TOP_LEFT;
		}

		// Top-right corner
		if (x + windowWidth >= rightEdge - SNAP_THRESHOLD && y <= topEdge + SNAP_THRESHOLD) {
			return SnapType.TOP_RIGHT;
		}

		// Bottom-left corner
		if (x <= SNAP_THRESHOLD && y + windowHeight >= bottomEdge - SNAP_THRESHOLD) {
			return SnapType.BOTTOM_LEFT;
		}

		// Bottom-right corner
		if (
			x + windowWidth >= rightEdge - SNAP_THRESHOLD &&
			y + windowHeight >= bottomEdge - SNAP_THRESHOLD
		) {
			return SnapType.BOTTOM_RIGHT;
		}

		// Then check edges
		// Top edge (full screen)
		if (y <= topEdge) {
			return SnapType.TOP;
		}

		// Left edge
		if (x <= SNAP_THRESHOLD) {
			return SnapType.LEFT;
		}

		// Right edge
		if (x + windowWidth >= rightEdge - SNAP_THRESHOLD) {
			return SnapType.RIGHT;
		}

		// No snap zone detected
		return SnapType.NONE;
	}

	// Calculate dimensions for a specific snap type
	function calculateSnapDimensions(
		snapType: SnapType,
		viewportWidth: number,
		viewportHeight: number
	): SnapPreview['dimensions'] {
		// Default dimensions (no snap)
		let dimensions = {
			x: coords.current.x,
			y: coords.current.y,
			w: 0,
			h: 0
		};

		// Get the current window's dimensions if needed
		const unsubscribe = windowsStore.subscribe((windows) => {
			const window = windows.find((w) => w.id === id);
			if (window) {
				dimensions.w = window.w;
				dimensions.h = window.h;
			}
		});
		unsubscribe();

		// Calculate the maximum usable width and height
		const maxWidth = viewportWidth - offset * 2;
		const maxHeight = viewportHeight - navHeight - offset * 2;

		// Calculate dimensions based on snap type
		switch (snapType) {
			case SnapType.TOP: // Full screen
				dimensions = {
					x: offset,
					y: navHeight + offset,
					w: maxWidth,
					h: maxHeight
				};
				break;

			case SnapType.LEFT: // Left half
				dimensions = {
					x: offset,
					y: navHeight + offset,
					w: maxWidth / 2,
					h: maxHeight
				};
				break;

			case SnapType.RIGHT: // Right half
				dimensions = {
					x: viewportWidth / 2 + offset / 2,
					y: navHeight + offset,
					w: maxWidth / 2,
					h: maxHeight
				};
				break;

			case SnapType.TOP_LEFT: // Top-left quarter
				dimensions = {
					x: offset,
					y: navHeight + offset,
					w: maxWidth / 2,
					h: maxHeight / 2
				};
				break;

			case SnapType.TOP_RIGHT: // Top-right quarter
				dimensions = {
					x: viewportWidth / 2 + offset / 2,
					y: navHeight + offset,
					w: maxWidth / 2,
					h: maxHeight / 2
				};
				break;

			case SnapType.BOTTOM_LEFT: // Bottom-left quarter
				dimensions = {
					x: offset,
					y: navHeight + viewportHeight / 2,
					w: maxWidth / 2,
					h: maxHeight / 2
				};
				break;

			case SnapType.BOTTOM_RIGHT: // Bottom-right quarter
				dimensions = {
					x: viewportWidth / 2 + offset / 2,
					y: navHeight + viewportHeight / 2,
					w: maxWidth / 2,
					h: maxHeight / 2
				};
				break;
		}

		return dimensions;
	}

	// Create a preview window for the detected snap zone
	function createSnapPreview(
		snapType: SnapType,
		viewportWidth: number,
		viewportHeight: number
	): string | null {
		// Don't create preview if no snap zone detected
		if (snapType === SnapType.NONE) return null;

		// Create a preview ID based on the original window ID and snap type
		const previewId = `preview-${id}-${snapType}`;

		// Calculate the dimensions for this snap type
		const dimensions = calculateSnapDimensions(snapType, viewportWidth, viewportHeight);

		// Get current window data to copy its properties
		let currentWindow: WindowData | undefined;
		const unsubscribe = windowsStore.subscribe((windows) => {
			currentWindow = windows.find((w) => w.id === id);
		});
		unsubscribe();

		if (!currentWindow) return null;

		// Update the store with the new preview window
		windowsStore.update((windows) => {
			// Remove any existing preview for this window
			const filteredWindows = windows.filter((w) => !w.id.includes(`preview-${id}`));

			// Create the preview window
			const previewWindow: WindowData = {
				id: previewId,
				name: currentWindow!.name,
				content: currentWindow!.content,
				w: dimensions.w,
				h: dimensions.h,
				pos: {
					x: dimensions.x,
					y: dimensions.y,
					z: 9999 // Maximum Z-index to always be on top
				},
				active: true,
				isMinimized: false,
				isMaximized: snapType === SnapType.TOP, // Only TOP is considered maximized
				isPreview: true,
				previewFor: id,
				snapType: snapType // Add the snap type to the window data
			};

			return [...filteredWindows, previewWindow];
		});

		return previewId;
	}

	// Remove all preview windows for this window
	function removeSnapPreviews() {
		windowsStore.update((windows) => {
			return windows.filter((w) => !w.id.includes(`preview-${id}`));
		});
	}

	// Apply the selected snap to the actual window
	function applySnap(
		snapType: SnapType,
		viewportWidth: number,
		viewportHeight: number,
		tempSize: { w: number; h: number; pos: { x: number; y: number } }
	) {
		if (snapType === SnapType.NONE) return;

		// Calculate dimensions for the snap type
		const dimensions = calculateSnapDimensions(snapType, viewportWidth, viewportHeight);

		// Update window position and size
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index === -1) return windows;

			const currentWindow = windows[index];

			if (tempSize) {
				currentWindow.previousSize = tempSize;
			}

			// Update window dimensions and position
			currentWindow.w = dimensions.w;
			currentWindow.h = dimensions.h;
			currentWindow.pos.x = dimensions.x;
			currentWindow.pos.y = dimensions.y;

			// Only set isMaximized true if it's a TOP snap (full screen)
			const wasMaximized = currentWindow.isMaximized;
			currentWindow.isMaximized = snapType === SnapType.TOP;

			// Store the current snap type
			currentWindow.snapType = snapType;

			return windows;
		});

		// Update the spring position
		coords.set(
			{
				x: dimensions.x,
				y: dimensions.y
			},
			{ instant: true }
		);

		// Keep track of the current snap type
		currentSnapType = snapType;
	}

	// Check if window is currently snapped
	function isSnapped(): boolean {
		let isWindowSnapped = false;

		// Check in the store to be sure
		const unsubscribe = windowsStore.subscribe((windows) => {
			const window = windows.find((w) => w.id === id);
			if (window) {
				isWindowSnapped = window.snapType !== undefined && window.snapType !== SnapType.NONE;
			}
		});
		unsubscribe();

		return isWindowSnapped;
	}

	// Get the current snap type
	function getSnapType(): SnapType {
		let snapType = SnapType.NONE;

		// Get from the store to be accurate
		const unsubscribe = windowsStore.subscribe((windows) => {
			const window = windows.find((w) => w.id === id);
			if (window && window.snapType) {
				snapType = window.snapType;
			}
		});
		unsubscribe();

		return snapType;
	}

	// Restore window to pre-snap state
	function restoreFromSnap() {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index === -1) return windows;

			const currentWindow = windows[index];

			// Restore previous size and position if available
			if (currentWindow.previousSize) {
				currentWindow.w = currentWindow.previousSize.w;
				currentWindow.h = currentWindow.previousSize.h;
				currentWindow.pos.x = currentWindow.previousSize.pos.x;
				currentWindow.pos.y = currentWindow.previousSize.pos.y;

				// Update the spring position
				coords.set(
					{
						x: currentWindow.previousSize.pos.x,
						y: currentWindow.previousSize.pos.y
					},
					{ instant: true }
				);

				// Reset previousSize only when actually restoring to normal state
				currentWindow.previousSize = undefined;
			}

			// Reset maximized and snap type state
			currentWindow.isMaximized = false;
			currentWindow.snapType = SnapType.NONE;

			return windows;
		});

		// Reset current snap type
		currentSnapType = SnapType.NONE;
	}

	// Return the public API for the window snap functionality
	return {
		detectSnapZone,
		createSnapPreview,
		removeSnapPreviews,
		applySnap,
		isSnapped,
		getSnapType,
		restoreFromSnap
	};
}
