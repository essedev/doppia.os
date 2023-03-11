<script>
    import Window from './window.svelte';
</script>

<div style="display: block; position:relative; width: 100%; height: 100%;">
	<Window name='Window' w=650 h=400/>
</div>

<style>
	:global(body) {
		overflow: hidden;
		background-color: #048282;
	}
</style>