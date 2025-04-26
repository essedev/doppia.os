<script lang="ts">
	import { windowsStore } from '$lib/utils/stores';

	let selectedWindowId: string = '';
	$: selectedWindow = $windowsStore.find((w) => w.id === selectedWindowId);
</script>

<div class="stats">
	<p>Windows metrics</p>

	<select bind:value={selectedWindowId}>
		{#each $windowsStore.filter((w) => w.active) as window}
			<option value={window.id}>{window.name}</option>
		{/each}
	</select>

	{#if selectedWindow?.active}
		<span>WIDTH: {selectedWindow.w}px</span>
		<span>HEIGHT: {selectedWindow.h}px</span>
		<span>X: {selectedWindow.pos.x}px</span>
		<span>Y: {selectedWindow.pos.y}px</span>
		<span>Z: {selectedWindow.pos.z}</span>
	{/if}
</div>

<style>
	.stats {
		position: absolute;
		right: 20px;
		bottom: 20px;
		background-color: rgba(0, 0, 0, 0.2);
		color: rgb(240, 240, 240);
		padding: 20px;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
	}

	p {
		margin: 8px 0 15px 0;
		font-size: 16px;
	}

	select {
		margin-bottom: 10px;
		border: solid 1px rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		padding: 8px;
		background-color: transparent;
		color: rgb(240, 240, 240);
		font-size: 16px;
	}

	select option {
		color: rgb(0, 0, 0, 0.8);
	}

	span {
		margin-top: 5px;
	}
</style>
