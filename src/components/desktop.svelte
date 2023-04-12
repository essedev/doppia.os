<script>
	import "boxicons";
	import Window from "./window.svelte";
	import ForkMe from "./forkme.svelte";
	import Navbar from "./navbar.svelte";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import * as Fathom from "fathom-client";

	onMount(() => {
		Fathom.load("YEGXYCZY", {
			// optional - add your website domain(s) to avoid views during development
			includedDomains: ['doppiaesse.tech', 'www.doppiaesse.tech']
		});
	});

	// track a page view when the pathname changes
	$: $page.url.pathname, browser && Fathom.trackPageview();
</script>

<svelte:head>
	<title>doppia.os</title>
</svelte:head>

<Navbar />
<div class="view">
	<ForkMe />
	<Window name="Window" w="650" h="400" />
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: #048282;
	}

	.view {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
