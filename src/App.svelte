<script>
	import { spring } from 'svelte/motion';
	import { pannable } from './pannable.js';

	let { width, height } = window.screen
	let size = [700, 400]
	let out = [0, 0]

	const coords = spring({ x: 0, y: 0 }, {
		stiffness: 0.2,
		damping: 0.4
	})

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event) {
		coords.update($coords => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
		out[0] = Math.abs($coords.x) - (width - size[0]) / 2
		out[1] = Math.abs($coords.y) - Math.ceil((height - size[1]) / 2)
	}

	function handlePanEnd(event) {
		coords.stiffness = 0.2;
		coords.damping  = 0.4;

		if (out[0] > 0) {
			if ($coords.x > 0) {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({ x: $coords.x - out[0], y: $coords.y - out[1] });
					} else {
						coords.set({ x: $coords.x - out[0], y: $coords.y + out[1] });
					}
				} else {
					coords.set({ x: $coords.x - out[0], y: $coords.y });
				}
			} else {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({ x: $coords.x + out[0], y: $coords.y - out[1] });
					} else {
						coords.set({ x: $coords.x + out[0], y: $coords.y + out[1] });
					}
				} else {
					coords.set({ x: $coords.x + out[0], y: $coords.y });
				}
			}
		}

		if (out[1] > 0) {
			if (out[0] < 0) {
				if ($coords.y > 0) {
					coords.set({ x: $coords.x, y: $coords.y - out[1] });
				} else {
					coords.set({ x: $coords.x, y: $coords.y + out[1] });
				}
			}
		}

	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>

<div class="box" style="--width: {size[0]}px; --height: {size[1]}px; transform: translate({$coords.x}px,{$coords.y}px)">
	<div class="head" use:pannable on:panstart={handlePanStart} on:panmove={handlePanMove} on:panend={handlePanEnd}>
		sussy baki
	</div>
</div>

<div class="info">
	<h2>Info</h2>
	<p>{width} x {height}</p>
	<p>{$coords.x} x {$coords.y}</p>
	<p>{out[0]} - {out[1]}</p>
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
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		cursor: grab;
	}

	.head:active {
		cursor: grabbing;
	}

	.info {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 50px;
		text-align: right;
	}

	:global(body) {
		overflow: hidden;
		background-color: #048282;
	}
</style>