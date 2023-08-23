<script lang="ts">
	import { resizable } from "$lib/utils/resizable.js"
</script>

<div class="box" use:resizable>Box</div>

<style>
	.box {
		left: 300px;
		top: 100px;
		height: 100px;
		width: 100px;
		background: #e5e5e5;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		user-select: none;
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

	:global(.hide-grabber .grabber) {
		background: transparent !important;
		border: none !important;
	}

	:global(.grabber.selected) {
		border: solid 1px black;
	}
</style>
