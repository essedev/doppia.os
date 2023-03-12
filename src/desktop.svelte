<script>
	import Window from "./window.svelte";
</script>

<Window name="Window" w="650" h="400" />

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	
	:global(body) {
		background-color: #048282;
	}
</style>
