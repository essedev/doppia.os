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
	<span class="menuBtn">
		<box-icon name="grid-alt" />
	</span>
	<button class="link-btn">Home</button>
	<button class="link-btn">About</button>
	<button class="link-btn">Projects</button>
	<button class="link-btn">Contact</button>
	<span class="fullscreenBtn">
		<button class="no-btn" on:click={fullscreenToggle}>
			<box-icon id="fullscreenIcon" name="fullscreen" />
			<box-icon id="exitFullscreenIcon" name="exit-fullscreen" style="display: none;" />
		</button>
	</span>
</div>

<style>
	/* Add a black background color to the top navigation */
	.topnav {
		background-color: #eeeeee;
		overflow: hidden;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		display: flex;
	}

	/* Style the links inside the navigation bar */
	.topnav span {
		float: left;
		text-align: center;
		padding: 15px 10px 10px 10px;
		text-decoration: none;
		font-size: 18px;
	}

	/* Style the fullscreen button */
	.fullscreenBtn {
		margin-left: auto;
		padding: 15px 16px 10px 16px !important;
	}

	/* Style the menu button */
	.menuBtn {
		padding: 15px 8px 10px 16px !important;
	}

	.topnav button {
		background-color: transparent;
		border: none;
		margin: 0;
		padding: 0;
		cursor: pointer;
		outline: none;
	}

	.link-btn {
		margin: 10px !important;
		font-size: 18px;
		text-align: center;
		font-family: monospace;
	}

	box-icon {
		fill: #333333;
	}
</style>
