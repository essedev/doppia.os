<script lang="ts">
	import { windowsStore } from '$lib/utils/stores';

	function fullscreenToggle() {
		const fullscreenElement = document.fullscreenElement as HTMLElement;
		const fullscreenIcon = document.getElementById('fullscreenIcon') as HTMLElement;

		if (!fullscreenElement) {
			document.documentElement.requestFullscreen();
			fullscreenIcon.setAttribute(
				'd',
				'M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z'
			);
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
				fullscreenIcon.setAttribute(
					'd',
					'M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z'
				);
			}
		}
	}

	function activateWindow(id: string) {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);

			windows[index].active = !windows[index].active;
			return windows;
		});

		document.getElementById(id)?.classList.toggle('active');
	}
</script>

<div class="navbar">
	<button class="menuBtn">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			style="fill: rgba(0, 0, 0, 1);"
			><path
				d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4h-4V5zM3 20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6zm2-5h4v4h-4v-4z"
			/></svg
		>
	</button>

	<button id="wip" class="link-btn active" on:click={() => activateWindow('wip')}> Home </button>
	<button id="about" class="link-btn" on:click={() => activateWindow('about')}> About </button>
	<button id="projects" class="link-btn" on:click={() => activateWindow('projects')}
		>Projects</button
	>
	<button id="contact" class="link-btn" on:click={() => activateWindow('contact')}>Contact</button>

	<button class="fullscreenBtn" on:click={fullscreenToggle}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			style="fill: rgba(0, 0, 0, 1);"
			><path
				id="fullscreenIcon"
				d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z"
			/></svg
		>
	</button>
</div>

<style>
	.navbar {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 50px;
		z-index: 11;
		display: flex;
		background-color: #eeeeee;
		overflow: hidden;
		border-bottom: 1px solid #cccccc;
	}

	.navbar button {
		cursor: pointer;
		border: none;
		background: none;
	}

	.active {
		margin-top: 2px;
		background-color: #dddddda1 !important;
		border-bottom: 2px solid #333333 !important;
	}

	.link-btn {
		margin-left: 10px;
		padding: 0 10px 0 10px;
		font-size: 18px;
	}

	/* Style the fullscreen button */
	.fullscreenBtn {
		margin-left: auto;
		padding-inline: 14px;
		padding-top: 13px;
		padding-bottom: 9px;
	}

	/* Style the menu button */
	.menuBtn {
		padding-inline: 14px;
		padding-top: 13px;
		padding-bottom: 9px;
	}
</style>
