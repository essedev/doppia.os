<script lang="ts">
	import { windowsStore } from "$lib/utils/stores"

	function fullscreenToggle() {
		const fullscreenElement = document.fullscreenElement as HTMLElement

		const fullscreenIcon = document.getElementById(
			"fullscreenIcon"
		) as HTMLElement

		if (!fullscreenElement) {
			document.documentElement.requestFullscreen()
			fullscreenIcon.setAttribute("name", "exit-fullscreen")
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen()
				fullscreenIcon.setAttribute("name", "fullscreen")
			}
		}
	}

	function activateWindow(id: string) {
		windowsStore.update((windows) => {
			const wIndex = windows.findIndex((window) => window.id === id)

			windows[wIndex].active = !windows[wIndex].active
			return windows
		})

		document.getElementById(id)?.classList.toggle("active")
	}
</script>

<div class="navbar">
	<button class="menuBtn">
		<box-icon name="grid-alt" />
	</button>

	<button
		id="wip"
		class="link-btn active"
		on:click={() => activateWindow("wip")}>
		Home
	</button>
	<button
		id="about"
		class="link-btn"
		on:click={() => activateWindow("about")}>
		About
	</button>
	<button
		id="projects"
		class="link-btn"
		on:click={() => activateWindow("projects")}>Projects</button>
	<button
		id="contact"
		class="link-btn"
		on:click={() => activateWindow("contact")}>Contact</button>

	<button class="fullscreenBtn" on:click={fullscreenToggle}>
		<box-icon id="fullscreenIcon" name="fullscreen" />
	</button>
</div>

<style>
	.navbar {
		position: fixed;
		width: 100%;
		z-index: 11;
		display: flex;
		background-color: #eeeeee;
		overflow: hidden;
		border-bottom: 1px solid #cccccc;
	}

	.navbar button {
		cursor: pointer;
		border: none;
	}

	.active {
		margin-top: 2px;
		background-color: #dddddda1;
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

	box-icon {
		fill: #333333;
	}
</style>
