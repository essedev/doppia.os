<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import * as Fathom from 'fathom-client';
    import Navbar from "../components/navbar.svelte";

	onMount(() => {
		Fathom.load('YEGXYCZY', {
			// optional - add your website domain(s) to avoid views during development
			includedDomains: ['doppiaesse.tech', 'www.doppiaesse.tech']
		});
	});

	// track a page view when the pathname changes
	$: $page.url.pathname, browser && Fathom.trackPageview();
</script>

<Navbar />

<slot />
