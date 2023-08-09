<script lang="ts">
	import { SvelteComponent, onMount } from "svelte"
	import type { ComponentType } from "svelte"
	import { spring } from "svelte/motion"
	import { fade } from "svelte/transition"
	import { pannable } from "$lib/utils/pannable.js"
	import { windowsStore } from "$lib/utils/stores"

	export let id: string,
		name: string,
		content: ComponentType<SvelteComponent>,
		w: number,
		h: number,
		posX: number,
		posY: number,
		posZ: number

	let width: number, height: number

	$: width, height && setTimeout(checkOverflow, 300)

	// Calculate the size of the window
	$: size = [(width * w) / 1900, (height * h) / 900]

	// Min window width is 300px
	$: size[0] = Math.max(300, size[0])
	// Min window height is 200px
	$: size[1] = Math.max(200, size[1])

	// Create a spring for the window coordinates
	const coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	)

	function checkOverflow() {
		let offset = 10
		let navHeight = 50

		// Calculate the maximum allowed position for the window
		const maxX = width - size[0]
		const maxY = height - size[1]

		// Check if the window is outside the horizontal borders
		let newX = $coords.x
		if ($coords.x < 0) {
			// Return the window to the start of the visible window
			newX = 0 + offset
		} else if ($coords.x > maxX) {
			// Return the window to the end of the visible window
			newX = maxX - offset
		}

		// Check if the window is outside the vertical borders
		let newY = $coords.y
		if ($coords.y < 0 + navHeight) {
			// Return the window to the start of the visible window
			newY = 0 + offset + navHeight
		} else if ($coords.y > maxY) {
			// Return the window to the end of the visible window
			newY = maxY - offset
		}

		// Set the new window coordinates
		coords.set({ x: newX, y: newY })

		// Update the coordinates of the window in the store
		windowsStore.update((windows) => {
			const wIndex = windows.findIndex((window) => window.id === id)

			windows[wIndex].x = newX
			windows[wIndex].y = newY

			return windows
		})
	}

	function toFront() {
		windowsStore.update((windows) => {
			const activeWindows = windows.filter((window) => window.active)
			const activeWindowCount = activeWindows.length

			const wIndex = windows.findIndex((window) => window.id === id)

			for (let i = 0; i < windows.length; i++) {
				if (windows[i].z > windows[wIndex].z) {
					windows[i].z -= 1
				}
			}

			windows[wIndex].z = activeWindowCount

			return windows
		})
	}

	function handlePanStart() {
		coords.stiffness = coords.damping = 1
		toFront()
	}

	function handlePanMove(event: { detail: { dx: number; dy: number } }) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}))
	}

	function handlePanEnd() {
		coords.stiffness = 0.2
		coords.damping = 0.4
		checkOverflow()
	}

	onMount(() => {
		coords.set({ x: posX, y: posY }, { hard: true })
		toFront()
	})
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<button
	in:fade={{ duration: 30 }}
	out:fade={{ duration: 30 }}
	on:click={() => toFront()}
	class="box"
	style="--width: {size[0]}px; --height: {size[1]}px; --posz: {posZ}; transform: translate({$coords.x}px,{$coords.y}px)">
	<div
		class="head"
		use:pannable
		on:panstart={handlePanStart}
		on:panmove={handlePanMove}
		on:panend={handlePanEnd}>
		<span class="name">{name} - {posZ}</span>
	</div>
	<div class="content">
		<svelte:component this={content} />
	</div>
</button>

<style>
	button {
		margin: 0;
		padding: 0;
		text-align: left;
		width: var(--width);
		height: var(--height);
	}

	.box {
		z-index: var(--posz);
		position: absolute;
		border-radius: 6px;
		background-color: #eeeeee;
		border: 1px solid #cccccc;
	}

	.head {
		height: 42px;
		border-radius: 6px 6px 0px 0px;
		border-bottom: 1px solid #cccccc;
		user-select: none;
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
		overflow: scroll;
		border-radius: 0px 0px 6px 6px;
	}
</style>
