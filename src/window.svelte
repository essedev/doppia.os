<script>
	import { spring } from 'svelte/motion'
	import { pannable } from './pannable.js'
	import mapTouchToMouseFor from 'svelte-touch-to-mouse'
  	mapTouchToMouseFor('.box')

	let width, height
	$: width, height && checkOverflow()
	export let name, w, h

	$: size = [(width * w) / 1920, (height * h) / 920]

	const coords = spring({ x: 0, y: 0 }, {
		stiffness: 0.2,
		damping: 0.4
	})

	function handlePanStart() {
		coords.stiffness = coords.damping = 1
	}

	function handlePanMove(event) {
		coords.update($coords => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}))
	}

	function checkOverflow() {
		let out = [Math.abs($coords.x) - Math.ceil((width - size[0]) / 2), Math.abs($coords.y) - Math.ceil((height - size[1]) / 2)]

		if (out[0] > 0) {
			if ($coords.x > 0) {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({ x: $coords.x - out[0], y: $coords.y - out[1] })
					} else {
						coords.set({ x: $coords.x - out[0], y: $coords.y + out[1] })
					}
				} else {
					coords.set({ x: $coords.x - out[0], y: $coords.y })
				}
			} else {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({ x: $coords.x + out[0], y: $coords.y - out[1] })
					} else {
						coords.set({ x: $coords.x + out[0], y: $coords.y + out[1] })
					}
				} else {
					coords.set({ x: $coords.x + out[0], y: $coords.y })
				}
			}
		}

		if (out[1] > 0) {
			if (out[0] < 0) {
				if ($coords.y > 0) {
					coords.set({ x: $coords.x, y: $coords.y - out[1] })
				} else {
					coords.set({ x: $coords.x, y: $coords.y + out[1] })
				}
			}
		}
	}

	function handlePanEnd() {
		coords.stiffness = 0.2
		coords.damping  = 0.4
		checkOverflow()
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>

<div class="box" style="--width: {size[0]}px; --height: {size[1]}px; transform: translate({$coords.x}px,{$coords.y}px)">
	<div class="head" use:pannable on:panstart={handlePanStart} on:panmove={handlePanMove} on:panend={handlePanEnd}>
		<span class="name">{name}</span>
	</div>
	<div class="content">
		<iframe src="https://doppiaesse.github.io/" title="Curriculum">
		</iframe>
	</div>
</div>

<style>
	.box {
		position: absolute;
		width: var(--width);
		height: var(--height);
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		left: calc(50% - var(--width) / 2);
		top: calc(50% - var(--height) / 2);
		border-radius: 6px;
		background-color: aliceblue;
	}

	.head {
		height: calc(var(--height) / 11);
		border-radius: 6px 6px 0px 0px;
		box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.48);
		user-select: none;
		cursor: grab;
		display: flex;
    	align-items: center;
	}

	.head:active {
		cursor: grabbing;
	}

	.name {
		position: absolute;
		left: calc(var(--width) / 70);
		font-size: calc(var(--height) / 23);
		margin-bottom: calc(var(--height) / 200);
	}
</style>