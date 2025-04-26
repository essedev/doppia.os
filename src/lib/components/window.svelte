<script lang="ts">
	import { pannable } from '$lib/utils/pannable.js';
	import { resizable } from '$lib/utils/resizable.js';
	import { windowsStore } from '$lib/utils/stores';
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	export let id: string, name: string, content: Component, pos: { x: number; y: number; z: number };

	const offset = 5,
		navHeight = 50;

	let width: number, height: number;
	$: width, height && setTimeout(checkOverflow, 300);

	// Get the window from the store
	$: currWindow = $windowsStore[$windowsStore.findIndex((w) => w.id === id)];

	// Calculate the size of the window
	//$: size = [(width * currWindow.w) / 1900, (height * currWindow.h) / 900]

	// Create a spring for the window coordinates using new Spring class
	const coords = new Spring(
		{ x: pos.x, y: pos.y },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	function checkOverflow() {
		// Calculate the maximum allowed position for the window
		const maxX = width - currWindow.w;
		const maxY = height - currWindow.h;

		// Check if the window is outside the horizontal borders
		let newX = coords.current.x;
		if (coords.current.x < 0) {
			// Return the window to the start of the visible window
			newX = 0 + offset;
		} else if (coords.current.x > maxX) {
			// Return the window to the end of the visible window
			newX = maxX - offset;
		}

		// Check if the window is outside the vertical borders
		let newY = coords.current.y;
		if (coords.current.y < 0 + navHeight) {
			// Return the window to the start of the visible window
			newY = 0 + offset + navHeight;
		} else if (coords.current.y > maxY) {
			// Return the window to the end of the visible window
			newY = maxY - offset;
		}

		// Set the new window coordinates
		coords.set({ x: newX, y: newY });

		// Update the coordinates of the window in the store
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);

			windows[index].pos.x = newX;
			windows[index].pos.y = newY;

			return windows;
		});
	}

	function toFront() {
		windowsStore.update((windows) => {
			const activeWindows = windows.filter((window) => window.active);
			const activeWindowCount = activeWindows.length;

			const index = windows.findIndex((window) => window.id === id);

			for (let i = 0; i < windows.length; i++) {
				if (windows[i].pos.z > windows[index].pos.z) {
					windows[i].pos.z -= 1;
				}
			}

			windows[index].pos.z = activeWindowCount;

			return windows;
		});
	}

	function handlePanStart() {
		coords.stiffness = 1;
		coords.damping = 1;
	}

	function handlePanMove(event: { detail: { dx: number; dy: number } }) {
		const current = coords.current;
		coords.set({
			x: current.x + event.detail.dx,
			y: current.y + event.detail.dy
		});
	}

	function handlePanEnd() {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		checkOverflow();
	}

	function handleResized(event: { detail: { w: number; h: number; x: number; y: number } }) {
		if (event.detail.w > width - offset * 2) {
			event.detail.w = width - offset * 2;
		}

		if (event.detail.h > height - navHeight - offset * 2) {
			event.detail.h = height - navHeight - offset * 2;
		}

		coords.set({ x: event.detail.x, y: event.detail.y }, { instant: true });

		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);

			windows[index].w = event.detail.w;
			windows[index].h = event.detail.h;

			windows[index].pos.x = event.detail.x;
			windows[index].pos.y = event.detail.y;

			return windows;
		});

		checkOverflow();
	}

	onMount(() => {
		toFront();
	});
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
	use:resizable
	on:resized={handleResized}
	in:fade={{ duration: 30 }}
	out:fade={{ duration: 30 }}
	on:focus={toFront}
	{id}
	class="box"
	tabindex="0"
	style="width: {currWindow.w}px; height: {currWindow.h}px; z-index: {pos.z}; left: {coords.current
		.x}px; top: {coords.current.y}px;"
>
	<div class="container">
		<div
			class="head"
			use:pannable
			on:panstart={handlePanStart}
			on:panmove={handlePanMove}
			on:panend={handlePanEnd}
		>
			<span class="name">{name}</span>
		</div>
		<div class="content">
			<svelte:component this={content} />
		</div>
	</div>
</div>

<style>
	.box {
		position: absolute;
		text-align: left;
		border-radius: 6px;
		background-color: #eeeeee;
		border: 1px solid #cccccc;
		overflow: hidden;
	}

	.container {
		position: absolute;
		height: 100%;
		width: 100%;
	}

	.head {
		height: 42px;
		border-radius: 6px 6px 0px 0px;
		border-bottom: 1px solid #cccccc;
		cursor: grab;
		display: flex;
		align-items: center;
		position: relative;
	}

	.head:active {
		cursor: grabbing;
	}

	.name {
		margin-left: 15px;
		font-size: 18px;
	}

	.content {
		padding: 15px;
		font-size: 16px;
		height: calc(100% - 72px);
		overflow: auto;
		border-radius: 0px 0px 6px 6px;
	}

	:global(.grabber) {
		position: absolute;
		box-sizing: border-box;
	}

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

	:global(.grabber.selected) {
		border: solid 1px black;
	}
</style>
