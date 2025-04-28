<!-- Main page component for doppia.os: handles loading screen, navbar, stats, and dynamic windows -->
<script lang="ts">
	import { PUBLIC_NODE_ENV } from '$env/static/public';
	import Forkme from '$lib/components/forkme.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Stats from '$lib/components/stats.svelte';
	import Window from '$lib/components/window.svelte';
	import { windowsStore } from '$lib/stores/windows';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import '../app.css';

	// State variables to control the loading screen visibility
	let isLoading = true;
	let loadingBg = true;

	// Use onMount to manage the loading screen fade-out sequence
	onMount(() => {
		// Fade out the background slightly before the main loading text
		setTimeout(() => {
			loadingBg = false;
		}, 200);

		// Hide the main loading screen after a delay
		setTimeout(() => {
			isLoading = false;
		}, 1300);
	});
</script>

<svelte:head>
	<title>doppia.os</title>
</svelte:head>

<!-- Loading screen display -->
{#if isLoading}
	<!-- Background element that fades out -->
	{#if loadingBg}
		<div class="loadingBg" out:fade={{ duration: 800 }}></div>
	{/if}
	<!-- Loading text element that fades out -->
	<div class="loading" out:fade={{ duration: 250 }}>
		<p>Loading...</p>
	</div>
{/if}

<!-- Navigation bar component -->
<Navbar />

<!-- Display Forkme component only in production environment -->
{#if PUBLIC_NODE_ENV === 'production'}
	<Forkme />
{/if}

<!-- Stats component display -->
{#if PUBLIC_NODE_ENV === 'development'}
	<Stats />
{/if}

<!-- Iterate over the windows store and render active non-minimized windows -->
{#each $windowsStore as window (window.id)}
	{#if window.active && !window.isMinimized}
		<Window id={window.id} name={window.name} content={window.content} pos={window.pos} />
	{/if}
{/each}

<style>
	/* Styles for the loading text container */
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

	/* Styles for the loading background overlay */
	.loadingBg {
		z-index: 12;
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #048282;
	}
</style>
