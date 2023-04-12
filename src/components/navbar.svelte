<script>
	function fullscreenToggle() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			document.getElementById('fullscreenIcon').style.display = 'none';
			document.getElementById('exitFullscreenIcon').style.display = 'block';
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
				document.getElementById('fullscreenIcon').style.display = 'block';
				document.getElementById('exitFullscreenIcon').style.display = 'none';
			}
		}
	}
</script>

<div class="topnav">
	<button class="menuBtn">
		<box-icon name="grid-alt" />
	</button>
	<button class="link-btn">Home</button>
	<button class="link-btn">About</button>
	<button class="link-btn">Projects</button>
	<button class="link-btn">Contact</button>
	<button class="fullscreenBtn" on:click={fullscreenToggle}>
		<box-icon id="fullscreenIcon" name="fullscreen" />
		<box-icon id="exitFullscreenIcon" name="exit-fullscreen" style="display: none;" />
	</button>
</div>

<style>
	/* Add a black background color to the top navigation */
	.topnav {
		background-color: #eeeeee;
		overflow: hidden;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
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
		margin-right: 14px;
		font-size: 18px;
		text-align: center;
		font-family: monospace;
	}

	/* Style the fullscreen button */
	.fullscreenBtn {
		margin: 11px 16px 10px auto;
	}

	/* Style the menu button */
	.menuBtn {
		margin: 14px 16px 10px 16px;
	}

	box-icon {
		fill: #333333;
	}
</style>
