<script>
	import "boxicons";
	import Window from "./window.svelte";
	import ForkMe from "./forkme.svelte";
	import Navbar from "./navbar.svelte";
</script>

<!-- Fathom - beautiful, simple website analytics -->
<script src="https://cdn.usefathom.com/script.js" data-site="MFBUURDK" defer></script>
<!-- / Fathom -->

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
