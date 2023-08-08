<script lang="ts">
	import { windowsStore } from "$lib/utils/stores"
	import Forkme from "$lib/components/forkme.svelte"
	import Navbar from "$lib/components/navbar.svelte"
	import Window from "$lib/components/window.svelte"
	import "../app.css"
</script>

<svelte:head>
	<title>doppia.os</title>
</svelte:head>

<div class="view">
	<Navbar />

	<Forkme />

	{#each $windowsStore as window}
		{#if window.active}
			<Window
				id={window.id}
				name={window.name}
				content={window.content}
				w={window.w}
				h={window.h}
				posX={window.x}
				posY={window.y} />
		{/if}
	{/each}
</div>

<style>
	.view {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
