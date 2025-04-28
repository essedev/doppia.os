<!-- Window component: draggable, resizable window with smooth animations, dynamic stacking (z-index), and overflow management -->
<script lang="ts">
	import { pannable } from '$lib/actions/pannable';
	import { resizable } from '$lib/actions/resizable';
	import { windowManager } from '$lib/actions/windowManager';
	import { windowsStore } from '$lib/stores/windows';

	import type { Component } from 'svelte';
	import { onMount } from 'svelte';
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

	// State variables to track viewport dimensions
	let width = $state(0);
	let height = $state(0);

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

	// --- Event Handlers for Panning (Dragging) ---

	// Increase stiffness/damping for more responsive dragging
	function handlePanStart() {
		coords.stiffness = 1;
		coords.damping = 1;
	}

	// Update the spring's target position instantly based on the drag delta
	function handlePanMove(event: { detail: { dx: number; dy: number } }) {
		// Don't allow dragging if window is maximized
		const currentWindow = $windowsStore.find((w) => w.id === id);
		if (currentWindow?.isMaximized) return;

		const current = coords.current;
		coords.set(
			{
				x: current.x + event.detail.dx,
				y: current.y + event.detail.dy
			},
			{ instant: true }
		);
	}

	// Reset stiffness/damping for smooth animation and check for overflow
	function handlePanEnd() {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		checkOverflow(width, height);
	}

	// --- Event Handler for Resizing ---

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
	}

	// Event handlers for window controls
	function handleMinimize() {
		minimizeWindow();
	}

	// Close window handler che disattiva la finestra ma non la minimizza
	function handleClose() {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);
			if (index !== -1) {
				windows[index].active = false;
				windows[index].isMinimized = false;
				// Se era massimizzata, ripristina le dimensioni originali
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

	// Get the current window state from the store
	const currentWindow = $derived($windowsStore.find((w) => w.id === id));
	const isMaximized = $derived(currentWindow?.isMaximized || false);
</script>

<!-- Bind viewport dimensions to state variables -->
<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<!-- Main window container div -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="box"
	class:maximized={isMaximized}
	use:resizable={{ disabled: isMaximized }}
	onresized={handleResized}
	in:fade={{ duration: 30 }}
	out:fade={{ duration: 30 }}
	onfocus={toFront}
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
			onpanstart={handlePanStart}
			onpanmove={handlePanMove}
			onpanend={handlePanEnd}
		>
			<!-- Window title -->
			<span class="name">{name}</span>

			<!-- Window controls -->
			<div class="window-controls">
				<button class="control-btn minimize" onclick={handleMinimize} aria-label="Minimize">
					<span class="icon">_</span>
				</button>
				<button class="control-btn maximize" onclick={handleMaximize} aria-label="Maximize">
					<span class="icon">{isMaximized ? '↓' : '↑'}</span>
				</button>
				<button class="control-btn close" onclick={handleClose} aria-label="Close">
					<span class="icon">×</span>
				</button>
			</div>
		</div>
		<!-- Window content area -->
		<div class="content">
			<!-- Render the dynamic content component -->
			{@render content()}
		</div>
	</div>
</div>

<!-- Component-specific styles -->
<style>
	/* Global styles for grabber elements created by the resizable action */
	:global(.grabber) {
		position: absolute;
		box-sizing: border-box;
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
	}

	.box:focus {
		outline: none;
	}

	/* Styles for maximized windows */
	.maximized {
		border-radius: 0;
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

	/* Remove border radius when maximized */
	.maximized .head {
		border-radius: 0px;
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

	/* Window control buttons container */
	.window-controls {
		display: flex;
		margin-right: 10px;
	}

	/* Individual control button */
	.control-btn {
		width: 24px;
		height: 24px;
		margin-left: 8px;
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
	.minimize {
		font-size: 14px;
	}

	.maximize {
		font-size: 14px;
	}

	.close {
		font-size: 18px;
	}

	.close:hover {
		background-color: #ff6b6b;
		color: white;
	}

	/* Icon styling */
	.icon {
		line-height: 1;
	}
</style>
