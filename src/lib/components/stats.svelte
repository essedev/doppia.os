<script lang="ts">
	import type { WindowData } from '$lib/stores/windows';
	import { windowsStore } from '$lib/stores/windows';

	let selectedWindowId = $state('');
	let selectedWindow = $state<WindowData | undefined>(undefined);

	// Update the selected window when selectedWindowId changes
	$effect(() => {
		selectedWindow = $windowsStore.find((w) => w.id === selectedWindowId);
	});

	// Auto-select the window with the highest z-index (last interacted with)
	$effect(() => {
		const activeWindows = $windowsStore.filter((w) => w.active);
		if (activeWindows.length > 0) {
			// Find the window with the highest z-index
			const topWindow = activeWindows.reduce(
				(highest, current) => (current.pos.z > highest.pos.z ? current : highest),
				activeWindows[0]
			);
			selectedWindowId = topWindow.id;
		}
	});
</script>

<div class="stats">
	<p>Windows metrics</p>

	<select bind:value={selectedWindowId}>
		{#each $windowsStore.filter((w) => w.active) as window}
			<option value={window.id}>{window.name}</option>
		{/each}
	</select>

	{#if selectedWindow && selectedWindow.active}
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
