<script lang="ts">
	import { windowsStore } from "$lib/utils/stores"
	import Forkme from "$lib/components/forkme.svelte"
	import Navbar from "$lib/components/navbar.svelte"
	import Window from "$lib/components/window.svelte"
	import "../app.css"
	import { onMount } from "svelte"
	import { fade } from "svelte/transition"

	let isLoading = true
	let loadingBg = true
	onMount(() => {
		setTimeout(() => {
			loadingBg = false
		}, 200)

		setTimeout(() => {
			isLoading = false
		}, 1300)
	})
</script>

<svelte:head>
	<title>doppia.os</title>
</svelte:head>

{#if isLoading}
	{#if loadingBg}
		<div class="loadingBg" out:fade={{ duration: 800 }} />
	{/if}
	<div class="loading" out:fade={{ duration: 250 }}>
		<p>Loading...</p>
	</div>
{/if}

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

	.loading {
		z-index: 13;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 2rem;
	}

	.loadingBg {
		z-index: 12;
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #048282;
	}
</style>
