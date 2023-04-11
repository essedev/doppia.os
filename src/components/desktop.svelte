<script>
	import Window from "./window.svelte";
	import ForkMe from "./forkme.svelte";
	import Navbar from "./navbar.svelte";
	import 'boxicons'
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
