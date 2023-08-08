<script lang="ts">
	import { windowsStore } from "$lib/utils/stores"

	function fullscreenToggle() {
		const fullscreenElement = document.fullscreenElement as HTMLElement
		const fullscreenIcon = document.getElementById(
			"fullscreenIcon"
		) as HTMLElement
		const exitFullscreenIcon = document.getElementById(
			"exitFullscreenIcon"
		) as HTMLElement

		if (!fullscreenElement) {
			document.documentElement.requestFullscreen()
			fullscreenIcon.style.display = "none"
			exitFullscreenIcon.style.display = "block"
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen()
				fullscreenIcon.style.display = "block"
				exitFullscreenIcon.style.display = "none"
			}
		}
	}

	function activateWindow(id: string) {
		windowsStore.update((windows) => {
			return windows.map((window) => {
				if (window.id === id) {
					return { ...window, active: !window.active }
				}
				return window
			})
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
	<button class="link-btn">Projects</button>
	<button class="link-btn">Contact</button>

	<button class="fullscreenBtn" on:click={fullscreenToggle}>
		<box-icon id="fullscreenIcon" name="fullscreen" />
		<box-icon
			id="exitFullscreenIcon"
			name="exit-fullscreen"
			style="display: none;" />
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
		outline: none;
		padding: 0;
		border: none;
		cursor: pointer;
	}

	.active {
		margin-top: 2px;
		background-color: #dddddda1 !important;
		border-bottom: 2px solid #333333 !important;
	}

	.link-btn {
		margin-left: 10px;
		padding: 0 10px 0 10px !important;
		font-size: 18px;
	}

	/* Style the fullscreen button */
	.fullscreenBtn {
		margin: 12px 16px 9px auto;
	}

	/* Style the menu button */
	.menuBtn {
		margin: 14px 6px 10px 16px;
	}

	box-icon {
		fill: #333333;
	}
</style>
