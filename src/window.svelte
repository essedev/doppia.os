<script context="module">
	import DragDropTouch from "svelte-drag-drop-touch";
	import { asDraggable } from "svelte-drag-and-drop-actions";
</script>

<script>
	import { spring } from "svelte/motion";

	let width, height;
	$: width, height && checkOverflow();
	export let name, w, h;

	$: size = [(width * w) / 1920, (height * h) / 920];

	const coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.2,
			damping: 0.4,
		}
	);

	function checkOverflow() {
		let out = [
			Math.abs($coords.x) - Math.ceil((width - size[0]) / 2),
			Math.abs($coords.y) - Math.ceil((height - size[1]) / 2),
		];

		if (out[0] > 0) {
			if ($coords.x > 0) {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({
							x: $coords.x - out[0],
							y: $coords.y - out[1],
						});
					} else {
						coords.set({
							x: $coords.x - out[0],
							y: $coords.y + out[1],
						});
					}
				} else {
					coords.set({ x: $coords.x - out[0], y: $coords.y });
				}
			} else {
				if (out[1] > 0) {
					if ($coords.y > 0) {
						coords.set({
							x: $coords.x + out[0],
							y: $coords.y - out[1],
						});
					} else {
						coords.set({
							x: $coords.x + out[0],
							y: $coords.y + out[1],
						});
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

	function onDragStart() {
		coords.stiffness = coords.damping = 1;
		return { x: $coords.x, y: $coords.y };
	}

	function onDragMove(x, y, dx, dy) {
		coords.update(($coords) => ({
			x: x,
			y: y,
		}));
	}

	function onDragEnd(x, y, dx, dy) {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		checkOverflow();
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div
	class="box"
	style="--width: {size[0]}px; --height: {size[1]}px; width: var(--width); height: var(--height); transform: translate({$coords.x}px,{$coords.y}px);"
	use:asDraggable={{ onDragStart, onDragMove, onDragEnd }}>
	<div class="head">
		<span class="name">{name}</span>
	</div>
	<div class="content">
		test
	</div>
</div>

<style>
	.box {
		display: block;
		position: absolute;
		left: calc(50% - var(--width) / 2);
		top: calc(50% - var(--height) / 2);
		line-height: 30px;
		text-align: center;
		cursor: move;
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
		position: relative;
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

	.content {
		height: calc(var(--height) / 1.1);
		border-radius: 0px 0px 6px 6px;
		user-select: none;
		cursor: grab;
		display: flex;
		align-items: center;
		position: relative;
	}

	:global([draggable]) {
		-webkit-touch-callout: none;
		-ms-touch-action: none;
		touch-action: none;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
</style>
