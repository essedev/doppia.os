<script lang="ts">
	import { windows } from "$lib/utils/stores"

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
		windows.update((windows) => {
			return windows.map((window) => {
				if (window.id === id) {
					return { ...window, active: !window.active }
				}
				return window
			})
		})
	}
</script>

<div class="topnav">
	<button class="menuBtn">
		<box-icon name="grid-alt" />
	</button>

	<button class="link-btn" on:click={() => activateWindow("wip")}
		>Home</button>
	<button class="link-btn" on:click={() => activateWindow("about")}
		>About</button>
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
	.topnav {
		background-color: #eeeeee;
		overflow: hidden;
		border-bottom: 1px solid #cccccc;
		display: flex;
	}

	.topnav button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		outline: none;
		padding: 0;
	}

	.link-btn {
		margin-left: 16px;
		padding: 0 6px 0 6px !important;
		font-size: 18px;
		text-align: center;
	}

	/* Style the fullscreen button */
	.fullscreenBtn {
		margin: 11px 16px 10px auto;
	}

	/* Style the menu button */
	.menuBtn {
		margin: 14px 0 10px 16px;
	}

	box-icon {
		fill: #333333;
	}
</style>
