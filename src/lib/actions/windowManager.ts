import type { WindowData } from '$lib/stores/windows';
import type { Spring } from 'svelte/motion';
import type { Writable } from 'svelte/store';

// WindowManager action: provides methods to enforce window bounds and manage z-index stacking
export function windowManager(
	coords: Spring<{ x: number; y: number }>,
	id: string,
	windowsStore: Writable<WindowData[]>,
	offset: number,
	navHeight: number
) {
	// Checks and corrects window overflow beyond viewport boundaries
	function checkOverflow(width: number, height: number) {
		// Obtain the latest window data from the store
		let window: WindowData | undefined;

		const store = windowsStore.subscribe((windows) => {
			const foundWindow = windows.find((w) => w.id === id);
			if (foundWindow) {
				window = foundWindow;
			}
		});
		store();

		// If window data is undefined or missing dimensions, exit early
		if (!window || typeof window.w === 'undefined' || typeof window.h === 'undefined') {
			return;
		}

		// Calculate the maximum allowed positions for X and Y
		const maxX = width - window.w;
		const maxY = height - window.h;

		// Check and adjust horizontal overflow
		let newX = coords.current.x;
		if (coords.current.x < 0) {
			// Snap window to left edge with offset
			newX = 0 + offset;
		} else if (coords.current.x > maxX) {
			// Snap window to right edge with offset
			newX = maxX - offset;
		}

		// Check and adjust vertical overflow
		let newY = coords.current.y;
		if (coords.current.y < 0 + navHeight) {
			// Snap window to top edge below navigation bar
			newY = 0 + offset + navHeight;
		} else if (coords.current.y > maxY) {
			// Snap window to bottom edge with offset
			newY = maxY - offset;
		}

		// Apply corrected coordinates to the Spring animation
		coords.set({ x: newX, y: newY });

		// Update the window position in the store
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].pos.x = newX;
				windows[index].pos.y = newY;
			}
			return windows;
		});
	}

	// Brings the current window to the front by adjusting its z-index
	function toFront() {
		windowsStore.update((windows) => {
			// Count how many windows are active to determine new z-index
			const activeWindows = windows.filter((window) => window.active);
			const activeWindowCount = activeWindows.length;

			// Find the index of the current window
			const index = windows.findIndex((window) => window.id === id);
			if (index === -1) return windows;

			// Decrease z-index of any windows that are above the current window
			for (let i = 0; i < windows.length; i++) {
				if (windows[i].pos.z > windows[index].pos.z) {
					windows[i].pos.z -= 1;
				}
			}

			// Set this window's z-index to highest among active windows
			windows[index].pos.z = activeWindowCount;

			return windows;
		});
	}

	// Minimize window functionality
	function minimizeWindow() {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].isMinimized = true;
			}
			return windows;
		});
	}

	// Restore window from minimized state
	function restoreFromMinimized() {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].isMinimized = false;
				toFront();
			}
			return windows;
		});
	}

	// Toggle maximize window functionality
	function toggleMaximize(viewportWidth: number, viewportHeight: number) {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index === -1) return windows;

			const currentWindow = windows[index];

			if (currentWindow.isMaximized) {
				// Restore previous size and position
				if (currentWindow.previousSize) {
					currentWindow.w = currentWindow.previousSize.w;
					currentWindow.h = currentWindow.previousSize.h;

					// Set position from previous position
					coords.set(
						{
							x: currentWindow.previousSize.pos.x,
							y: currentWindow.previousSize.pos.y
						},
						{ instant: true }
					);

					currentWindow.pos.x = currentWindow.previousSize.pos.x;
					currentWindow.pos.y = currentWindow.previousSize.pos.y;

					currentWindow.previousSize = undefined;
				}
				currentWindow.isMaximized = false;
			} else {
				// Save current size and position before maximizing
				currentWindow.previousSize = {
					w: currentWindow.w,
					h: currentWindow.h,
					pos: {
						x: currentWindow.pos.x,
						y: currentWindow.pos.y
					}
				};

				// Calculate maximum size considering offsets
				const maxWidth = viewportWidth - offset * 2;
				const maxHeight = viewportHeight - navHeight - offset * 2;

				// Update to maximized size
				currentWindow.w = maxWidth;
				currentWindow.h = maxHeight;

				// Position at top-left with offset
				const newX = offset;
				const newY = navHeight + offset;

				coords.set({ x: newX, y: newY });
				currentWindow.pos.x = newX;
				currentWindow.pos.y = newY;

				currentWindow.isMaximized = true;
			}

			return windows;
		});
	}

	// Expose all window management methods
	return {
		checkOverflow,
		toFront,
		minimizeWindow,
		restoreFromMinimized,
		toggleMaximize
	};
}
