<script lang="ts">
	import type { WindowData } from '$lib/stores/windows';
	import { windowsStore } from '$lib/stores/windows';

	let selectedWindowId = $state('');
	let selectedWindow = $state<WindowData | undefined>(undefined);

	$effect(() => {
		selectedWindow = $windowsStore.find((w) => w.id === selectedWindowId);
	});

	$effect(() => {
		const activeWindows = $windowsStore.filter((w) => w.active);
		if (activeWindows.length > 0) {
			const topWindow = activeWindows.reduce(
				(highest, current) => (current.pos.z > highest.pos.z ? current : highest),
				activeWindows[0]
			);
			selectedWindowId = topWindow.id;
		}
	});
</script>

<div class="stats">
	<p class="title">Windows metrics</p>

	<select class="window-select" bind:value={selectedWindowId}>
		{#each $windowsStore.filter((w) => w.active) as window}
			<option value={window.id}>{window.name}</option>
		{/each}
	</select>

	{#if selectedWindow && selectedWindow.active}
		<div class="metrics">
			<div><span class="label">WIDTH:</span> <span>{selectedWindow.w}px</span></div>
			<div><span class="label">HEIGHT:</span> <span>{selectedWindow.h}px</span></div>
			<div><span class="label">X:</span> <span>{selectedWindow.pos.x}px</span></div>
			<div><span class="label">Y:</span> <span>{selectedWindow.pos.y}px</span></div>
			<div><span class="label">Z:</span> <span>{selectedWindow.pos.z}</span></div>
		</div>
	{/if}
</div>

<style>
	.stats {
		position: absolute;
		right: 20px;
		bottom: 20px;
		background-color: rgba(0, 0, 0, 0.22);
		color: rgb(240, 240, 240);
		padding: 22px 26px 20px 26px;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		flex-direction: column;
		min-width: 220px;
		backdrop-filter: blur(2px);
	}

	.title {
		margin: 0 0 12px 0;
		font-size: 17px;
		font-weight: 500;
		letter-spacing: 0.5px;
	}

	.window-select {
		margin-bottom: 14px;
		border: 1px solid rgba(0, 0, 0, 0.18);
		border-radius: 7px;
		padding: 8px 10px;
		background-color: rgba(0, 0, 0, 0.08);
		color: rgb(240, 240, 240);
		font-size: 16px;
		transition: border 0.2s;
		outline: none;
		cursor: pointer;
	}
	.window-select:focus,
	.window-select:hover {
		border-color: rgba(240, 240, 240, 0.25);
	}

	.window-select option {
		color: rgb(0, 0, 0, 0.8);
	}

	.metrics {
		display: flex;
		flex-direction: column;
		gap: 7px;
		margin-top: 2px;
	}

	.metrics div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 15px;
	}

	.label {
		opacity: 0.7;
		font-size: 14px;
		letter-spacing: 0.5px;
		margin-right: 8px;
	}

	@media (max-width: 600px) {
		.stats {
			right: 8px;
			bottom: 8px;
			padding: 14px 10px 12px 10px;
			min-width: 140px;
		}
		.title {
			font-size: 15px;
		}
	}
</style>
