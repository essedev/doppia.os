<script lang="ts">
	import { windowsStore } from '$lib/stores/windows';

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

	// Unified window management
	function handleWindowButton(id: string) {
		windowsStore.update((windows) => {
			const index = windows.findIndex((window) => window.id === id);

			if (index !== -1) {
				// If the window is already active
				if (windows[index].active) {
					// If it's minimized, restore it
					if (windows[index].isMinimized) {
						windows[index].isMinimized = false;
					} else {
						// Otherwise, minimize it
						windows[index].isMinimized = true;
					}
				} else {
					// If it's not active, open it
					windows[index].active = true;
					windows[index].isMinimized = false;

					// Add 100 to x and y for each window already open
					windows.forEach((w) => {
						if (w.active && w.id !== id) {
							windows[index].pos.x += 100;
							windows[index].pos.y += 100;
						}
					});

					// Assign the highest z-index
					const activeWindows = windows.filter((w) => w.active);
					windows[index].pos.z = activeWindows.length;
				}
			}

			return windows;
		});
	}

	// Check if the window is active
	function isWindowActive(id: string) {
		const windowData = $windowsStore.find((window) => window.id === id);
		return windowData?.active || false;
	}

	// Check if the window is minimized
	function isWindowMinimized(id: string) {
		const windowData = $windowsStore.find((window) => window.id === id);
		return windowData?.isMinimized || false;
	}
</script>

<div class="navbar">
	<button class="menuBtn" aria-label="Open menu">
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

	<button
		id="wip"
		class="link-btn"
		class:active={isWindowActive('wip')}
		class:minimized={isWindowMinimized('wip')}
		on:click={() => handleWindowButton('wip')}
	>
		Home
	</button>

	<button
		id="about"
		class="link-btn"
		class:active={isWindowActive('about')}
		class:minimized={isWindowMinimized('about')}
		on:click={() => handleWindowButton('about')}
	>
		About
	</button>

	<button
		id="projects"
		class="link-btn"
		class:active={isWindowActive('projects')}
		class:minimized={isWindowMinimized('projects')}
		on:click={() => handleWindowButton('projects')}
	>
		Projects
	</button>

	<button
		id="photopea"
		class="link-btn"
		class:active={isWindowActive('photopea')}
		class:minimized={isWindowMinimized('photopea')}
		on:click={() => handleWindowButton('photopea')}
	>
		Photopea
	</button>

	<button
		id="contact"
		class="link-btn"
		class:active={isWindowActive('contact')}
		class:minimized={isWindowMinimized('contact')}
		on:click={() => handleWindowButton('contact')}
	>
		Contact
	</button>

	<button class="fullscreenBtn" on:click={fullscreenToggle} aria-label="Toggle fullscreen">
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

	.minimized {
		opacity: 0.7;
		border-bottom: 2px dashed #555555 !important;
	}

	.link-btn {
		margin-left: 10px;
		padding: 0 10px 0 10px;
		font-size: 18px;
		transition: all 0.2s ease;
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
