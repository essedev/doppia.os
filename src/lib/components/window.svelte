<!-- Window component: draggable, resizable window with smooth animations, dynamic stacking (z-index), and overflow management -->
<script lang="ts">
	import { pannable } from '$lib/actions/pannable';
	import { resizable } from '$lib/actions/resizable';
	import { windowManager } from '$lib/actions/windowManager';
	import type { WindowData } from '$lib/stores/windows';
	import { windowsStore } from '$lib/stores/windows';
	import type { Component } from 'svelte';
	import { onDestroy, onMount } from 'svelte';
	import { Spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	// Define component props
	const { id, name, content, pos } = $props<{
		id: string;
		name: string;
		content: Component;
		pos: { x: number; y: number; z: number };
	}>();

	// Constants for layout and positioning
	const offset = 5;
	const navHeight = 50;

	// Constant for the snap zone for maximization (distance from the top edge)
	const snapThreshold = 20;

	// State variables to track viewport dimensions
	let width = $state(0);
	let height = $state(0);

	// State for dragging towards the top
	let isDraggingNearTop = $state(false);
	let previewWindowId = $state<string | null>(null);

	// State for dragging a maximized window
	let initialCursorX = $state(0);
	let initialCursorY = $state(0);
	let wasMaximized = $state(false);
	let relativeHeadX = $state(0);
	let relativeHeadY = $state(0);
	let headElement: HTMLElement | null = $state(null);
	let windowElementWidth = $state(0); // Width of the window element

	// Create a Svelte Spring for smooth animation of window coordinates
	const coords = new Spring(
		{ x: pos.x, y: pos.y },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	// Initialize the windowManager action which handles z-index and overflow
	const { checkOverflow, toFront, minimizeWindow, restoreFromMinimized, toggleMaximize } =
		windowManager(coords, id, windowsStore, offset, navHeight);

	// Effect to check and correct window overflow when viewport dimensions change
	// A small delay allows the window element to potentially resize first
	$effect(() => {
		if (width && height) {
			setTimeout(() => {
				checkOverflow(width, height);
			}, 300);
		}
	});

	// Bring the window to the front when it's first mounted
	onMount(() => {
		toFront();
	});

	// Removes the preview window when the component is destroyed
	onDestroy(() => {
		removePreviewWindow();
	});

	// --- Event Handlers for Panning (Dragging) ---

	// Increase stiffness/damping for more responsive dragging
	function handlePanStart(event: { detail?: { x?: number; y?: number } } = {}) {
		coords.stiffness = 1;
		coords.damping = 1;
		// Reset state at the start of dragging
		removePreviewWindow();

		// Save the initial cursor position
		const currentWindow = $windowsStore.find((w) => w.id === id);
		wasMaximized = currentWindow?.isMaximized || false;

		// If the event contains position details (added by our pannable action)
		if (event.detail?.x !== undefined && event.detail?.y !== undefined && currentWindow) {
			initialCursorX = event.detail.x;
			initialCursorY = event.detail.y;

			// Calculate the relative cursor position in the title bar
			if (wasMaximized) {
				// Get the exact measurements of the bar element
				if (headElement && windowElement) {
					const headRect = headElement.getBoundingClientRect();
					// Calculate the relative position relative to the edge of the title bar
					relativeHeadX = initialCursorX - headRect.left;
					relativeHeadY = initialCursorY - headRect.top;

					// Save the current width of the window (maximized)
					windowElementWidth = windowElement.clientWidth;
				}
			}
		}
	}

	// Update the spring's target position instantly based on the drag delta
	function handlePanMove(event: { detail: { dx: number; dy: number; x?: number; y?: number } }) {
		// If the window was maximized, restore it to the previous size
		const currentWindow = $windowsStore.find((w) => w.id === id);

		if (wasMaximized && currentWindow?.isMaximized) {
			// Deactivate the maximized state and restore the previous size
			toggleMaximize(width, height);

			// Allow the system to complete the resizing
			setTimeout(() => {
				// Now that the window is resized, position it correctly
				if (
					event.detail.x !== undefined &&
					event.detail.y !== undefined &&
					relativeHeadX > 0 &&
					windowElement
				) {
					// Calculate the scale factor - ratio between current and previous width
					const currentWidth = windowElement.clientWidth;
					const scaleRatio = currentWidth / windowElementWidth;

					// Adjust the relative position based on the scale factor
					const adjustedRelativeX = relativeHeadX * scaleRatio;

					// Calculate the new position that keeps the cursor in the same relative position on the bar
					const newX = event.detail.x - adjustedRelativeX;
					const newY = event.detail.y - relativeHeadY;

					// Update the position directly
					coords.set({ x: newX, y: newY }, { instant: true });

					// Update the position in the store
					windowsStore.update((windows) => {
						const index = windows.findIndex((window) => window.id === id);
						if (index !== -1) {
							windows[index].pos.x = newX;
							windows[index].pos.y = newY;
						}
						return windows;
					});

					// Add an overflow check to ensure the window remains visible
					checkOverflow(width, height, true);
				}
			}, 10); // Slightly increased to ensure rendering is complete

			// Reset state
			wasMaximized = false;
			return;
		}

		// Do not allow dragging if the window is maximized (normal case)
		if (currentWindow?.isMaximized) return;

		const current = coords.current;
		const newX = current.x + event.detail.dx;
		const newY = current.y + event.detail.dy;

		// Update spring coordinates for smooth movement
		coords.set(
			{
				x: newX,
				y: newY
			},
			{ instant: true }
		);

		// Update window position in store for real-time stats updates
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].pos.x = newX;
				windows[index].pos.y = newY;
			}
			return windows;
		});

		// Check if the window is dragged near the top edge
		isDraggingNearTop = newY <= navHeight + snapThreshold;

		// Handle the preview when approaching the top edge
		if (isDraggingNearTop && !previewWindowId) {
			createPreviewWindow();
		} else if (!isDraggingNearTop && previewWindowId) {
			removePreviewWindow();
		}
	}

	// Create a maximized preview ghost window
	function createPreviewWindow() {
		const currentWindow = $windowsStore.find((w) => w.id === id);
		if (!currentWindow) return;

		// Create a simple ID for the preview window based on the original ID
		const previewId = 'preview-' + id;
		previewWindowId = previewId;

		// Calculate maximized dimensions
		const maxWidth = width - offset * 2;
		const maxHeight = height - navHeight - offset * 2;

		// Add the preview window to the store
		windowsStore.update((windows) => {
			// First remove any existing previews for this window
			const filteredWindows = windows.filter((w) => w.id !== previewId);

			// Create a copy of the current window as a preview
			const previewWindow: WindowData = {
				id: previewId,
				name: currentWindow.name,
				content: currentWindow.content,
				w: maxWidth,
				h: maxHeight,
				pos: {
					x: offset,
					y: navHeight + offset,
					z: 9999 // Maximum Z-index to always be on top
				},
				active: true,
				isMinimized: false,
				isMaximized: true,
				isPreview: true,
				previewFor: id
			};

			return [...filteredWindows, previewWindow];
		});
	}

	// Removes the preview window
	function removePreviewWindow() {
		if (!previewWindowId) return;

		windowsStore.update((windows) => {
			return windows.filter((window) => window.id !== previewWindowId);
		});

		previewWindowId = null;
	}

	// Reset stiffness/damping for smooth animation and check for overflow
	function handlePanEnd() {
		coords.stiffness = 0.2;
		coords.damping = 0.4;

		// If there is an active preview window, maximize the real window
		if (previewWindowId) {
			toggleMaximize(width, height);
			removePreviewWindow();
		} else {
			// Normal overflow check
			checkOverflow(width, height);
		}

		// Reset state
		isDraggingNearTop = false;
	}

	// --- Event Handler for Resizing ---

	// Handler for the 'onresizing' custom event from the `resizable` action during resize
	function handleResizing(event: { detail: { w: number; h: number; x: number; y: number } }) {
		// Don't allow resizing if window is maximized
		const currentWindow = $windowsStore.find((w) => w.id === id);
		if (currentWindow?.isMaximized) return;

		// Apply minimum size constraints
		if (event.detail.w < offset * 2) {
			event.detail.w = offset * 2;
		}
		if (event.detail.h < navHeight + offset * 2) {
			event.detail.h = navHeight + offset * 2;
		}

		// Update the spring's position in real-time
		coords.set({ x: event.detail.x, y: event.detail.y }, { instant: true });

		// Update the window's dimensions and position in the global windows store in real-time
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].w = event.detail.w;
				windows[index].h = event.detail.h;
				windows[index].pos.x = event.detail.x;
				windows[index].pos.y = event.detail.y;
			}
			return windows;
		});
	}

	// Handler for the 'onresized' custom event from the `resizable` action
	// Updates window dimensions and position in the store and checks for overflow
	function handleResized(event: { detail: { w: number; h: number; x: number; y: number } }) {
		// Don't allow resizing if window is maximized
		const currentWindow = $windowsStore.find((w) => w.id === id);
		if (currentWindow?.isMaximized) return;

		// Apply minimum size constraints
		if (event.detail.w < offset * 2) {
			event.detail.w = offset * 2;
		}
		if (event.detail.h < navHeight + offset * 2) {
			event.detail.h = navHeight + offset * 2;
		}

		// Instantly set the spring's position to the new position
		coords.set({ x: event.detail.x, y: event.detail.y }, { instant: true });

		// Update the window's dimensions and position in the global windows store
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].w = event.detail.w;
				windows[index].h = event.detail.h;
				windows[index].pos.x = event.detail.x;
				windows[index].pos.y = event.detail.y;
			}
			return windows;
		});

		// Check if the window is now outside viewport bounds
		checkOverflow(width, height);
	}

	// --- Window Control Functions ---

	// Handler for maximize toggle button
	function handleMaximize() {
		toggleMaximize(width, height);
		checkOverflow(width, height, true);
	}

	// Event handlers for window controls
	function handleMinimize() {
		minimizeWindow();
	}

	// Close window handler that deactivates the window but does not minimize it
	function handleClose() {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].active = false;
				windows[index].isMinimized = false;
				// If it was maximized, restore original dimensions
				if (windows[index].isMaximized && windows[index].previousSize) {
					windows[index].w = windows[index].previousSize.w;
					windows[index].h = windows[index].previousSize.h;
					windows[index].pos.x = windows[index].previousSize.pos.x;
					windows[index].pos.y = windows[index].previousSize.pos.y;
					windows[index].isMaximized = false;
					windows[index].previousSize = undefined;
				}
			}
			return windows;
		});
	}

	// Reference to the DOM element to manually manage grabbers
	let windowElement: HTMLElement;

	// Manually track isMaximized to ensure UI update
	let isMaximizedState = $state(false);

	// Check if this is a preview window
	let isPreviewWindow = $state(false);

	// Function that manually updates the state and grabbers
	function updateMaximizedState() {
		const win = $windowsStore.find((w) => w.id === id);

		// Update preview state
		isPreviewWindow = win?.isPreview || false;

		const newState = win?.isMaximized || false;

		// Update state only if it has changed
		if (isMaximizedState !== newState) {
			isMaximizedState = newState;

			// Manually update grabbers if the element is available
			if (windowElement) {
				const grabbers = windowElement.querySelectorAll('.grabber');
				grabbers.forEach((grabber) => {
					grabber.classList.toggle('disabled', isMaximizedState);
					(grabber as HTMLElement).style.display = isMaximizedState ? 'none' : 'block';
				});
			}
		}
	}

	// Monitor store changes and update local state
	$effect(() => {
		updateMaximizedState();
	});
</script>

<!-- Bind viewport dimensions to state variables -->
<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<!-- Main window container div -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="box"
	class:maximized={isMaximizedState}
	class:preview-window={isPreviewWindow}
	use:resizable={{ disabled: isMaximizedState }}
	onresizing={handleResizing}
	onresized={handleResized}
	in:fade={{ duration: 30 }}
	out:fade={{ duration: 30 }}
	onfocus={toFront}
	bind:this={windowElement}
	{id}
	tabindex="0"
	style="
		width: {$windowsStore.find((w) => w.id === id)?.w || 650}px;
		height: {$windowsStore.find((w) => w.id === id)?.h || 400}px;
		z-index: {pos.z};
		left: {coords.current.x}px;
		top: {coords.current.y}px;
	"
>
	<!-- Inner container for layout -->
	<div class="container">
		<!-- Window header: draggable area -->
		<div
			class="head"
			use:pannable
			class:no-drag={isPreviewWindow}
			onpanstart={handlePanStart}
			onpanmove={handlePanMove}
			onpanend={handlePanEnd}
			bind:this={headElement}
		>
			<!-- Window title -->
			<span class="name">{name}</span>

			<!-- Window controls -->
			<div class="window-controls">
				{#if !isPreviewWindow}
					<button class="control-btn minimize" onclick={handleMinimize} aria-label="Minimize">
						<span class="control-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								style="fill: rgba(0, 0, 0, 1);"><path d="M5 11h14v2H5z"></path></svg
							>
						</span>
					</button>
					<button class="control-btn maximize" onclick={handleMaximize} aria-label="Maximize">
						<span class="control-icon">
							{#if isMaximizedState}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									style="fill: rgba(0, 0, 0, 1);"
									><path d="M2 15h7v7h2v-9H2v2zM15 2h-2v9h9V9h-7V2z"></path></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									style="fill: rgba(0, 0, 0, 1);"
									><path d="M5 12H3v9h9v-2H5zm7-7h7v7h2V3h-9z"></path></svg
								>
							{/if}
						</span>
					</button>
					<button class="control-btn close" onclick={handleClose} aria-label="Close">
						<span class="control-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								style="fill: rgba(0, 0, 0, 1);"
								><path
									d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"
								></path></svg
							>
						</span>
					</button>
				{/if}
			</div>
		</div>
		<!-- Render the dynamic content component only if not preview -->
		{#if !isPreviewWindow}
			<div class="content">
				{@render content()}
			</div>
		{:else}
			<!-- Empty container for the preview -->
			<div class="preview-content"></div>
		{/if}
	</div>
</div>

<!-- Component-specific styles -->
<style>
	/* Global styles for grabber elements created by the resizable action */
	:global(.grabber) {
		position: absolute;
		box-sizing: border-box;
	}

	/* Hide grabbers when they're disabled */
	:global(.grabber.disabled) {
		display: none !important;
	}

	/* Styles for specific grabber directions */
	:global(.grabber.right) {
		width: 10px;
		height: 100%;
		right: -5px;
		cursor: col-resize;
	}

	:global(.grabber.left) {
		width: 10px;
		height: 100%;
		left: -5px;
		cursor: col-resize;
	}

	:global(.grabber.top) {
		height: 10px;
		width: 100%;
		top: -5px;
		cursor: row-resize;
	}

	:global(.grabber.bottom) {
		height: 10px;
		width: 100%;
		bottom: -5px;
		cursor: row-resize;
	}

	/* Styles for corner grabbers (larger hit area, circular) */
	:global(.grabber.top-left) {
		height: 20px;
		width: 20px;
		top: -10px;
		left: -10px;
		cursor: nw-resize;
		border-radius: 100%;
	}

	:global(.grabber.top-right) {
		height: 20px;
		width: 20px;
		top: -10px;
		right: -10px;
		cursor: ne-resize;
		border-radius: 100%;
	}

	:global(.grabber.bottom-left) {
		height: 20px;
		width: 20px;
		bottom: -10px;
		left: -10px;
		cursor: sw-resize;
		border-radius: 100%;
	}

	:global(.grabber.bottom-right) {
		height: 20px;
		width: 20px;
		bottom: -10px;
		right: -10px;
		cursor: se-resize;
		border-radius: 100%;
	}

	/* Style for the currently selected grabber */
	:global(.grabber.selected) {
		border: solid 1px black;
	}

	/* Base styles for the window box */
	.box {
		position: absolute;
		text-align: left;
		border-radius: 6px;
		background-color: #eeeeee;
		border: 1px solid #cccccc;
		overflow: hidden;
		transition: box-shadow 0.1s ease-in-out;
	}

	/* Style for the preview window */
	.preview-window {
		opacity: 0.6;
		pointer-events: none;
		box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.4);
		border-color: #88aaff;
		background-color: #ddeeff;
		animation: pulse 1.5s infinite alternate;
	}

	@keyframes pulse {
		from {
			box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.4);
		}
		to {
			box-shadow: 0px 0px 20px rgba(0, 100, 255, 0.6);
		}
	}

	.box:focus {
		outline: none;
	}

	/* Styles for the inner container */
	.container {
		position: absolute;
		height: 100%;
		width: 100%;
	}

	/* Styles for the window header */
	.head {
		height: 42px;
		border-radius: 6px 6px 0px 0px;
		border-bottom: 1px solid #cccccc;
		cursor: grab;
		display: flex;
		align-items: center;
		position: relative;
		justify-content: space-between;
		background-color: #f5f5f5;
	}

	/* Class to prevent dragging of the preview window */
	.no-drag {
		cursor: default;
		pointer-events: none;
	}

	.preview-window .head {
		background-color: #c4d8ff;
		color: #333333;
		font-weight: 500;
	}

	/* Cursor style when actively dragging the header */
	.head:active {
		cursor: grabbing;
	}

	/* Styles for the window title text */
	.name {
		margin-left: 15px;
		font-size: 18px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 70%;
	}

	/* Styles for the content area */
	.content {
		padding: 15px;
		font-size: 16px;
		/* Calculate height: total height - head height - padding */
		height: calc(100% - 42px - 15px - 15px);
		overflow: auto;
		border-radius: 0px 0px 6px 6px;
	}

	/* Empty area for the preview */
	.preview-content {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: repeating-linear-gradient(
			45deg,
			rgba(120, 160, 255, 0.1),
			rgba(120, 160, 255, 0.1) 10px,
			rgba(120, 160, 255, 0.2) 10px,
			rgba(120, 160, 255, 0.2) 20px
		);
	}

	/* Window control buttons container */
	.window-controls {
		display: flex;
		margin-right: 10px;
	}

	/* Individual control button */
	.control-btn {
		width: 24px;
		height: 24px;
		margin-left: 6px;
		border: none;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background-color: transparent;
	}

	.control-btn:hover {
		background-color: #dddddd;
	}

	/* Specific styles for each button type */
	.close:hover {
		background-color: #ff6b6b;
		color: white;
	}

	.minimize svg,
	.maximize svg {
		margin-bottom: -4px;
	}

	.close svg {
		margin-bottom: -5px;
	}
</style>
