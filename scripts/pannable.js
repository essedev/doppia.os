export function pannable(node) {
	let x;
	let y;
	let isTouchDevice = false;

	function handleDown(event) {
		isTouchDevice = event.type === "touchstart";

		x = isTouchDevice ? event.touches[0].clientX : event.clientX;
		y = isTouchDevice ? event.touches[0].clientY : event.clientY;

		node.dispatchEvent(
			new CustomEvent("panstart", {
				detail: { x, y },
			})
		);

		window.addEventListener(
			isTouchDevice ? "touchmove" : "mousemove",
			handleMove
		);
		window.addEventListener(
			isTouchDevice ? "touchend" : "mouseup",
			handleUp
		);
	}

	function handleMove(event) {
		if (isTouchDevice && event.touches.length > 1) {
			// ignore multitouch events
			return;
		}

		const dx =
			(isTouchDevice ? event.touches[0].clientX : event.clientX) - x;
		const dy =
			(isTouchDevice ? event.touches[0].clientY : event.clientY) - y;
		x = isTouchDevice ? event.touches[0].clientX : event.clientX;
		y = isTouchDevice ? event.touches[0].clientY : event.clientY;

		node.dispatchEvent(
			new CustomEvent("panmove", {
				detail: { x, y, dx, dy },
			})
		);
	}

	function handleUp(event) {
		x = isTouchDevice ? event.changedTouches[0].clientX : event.clientX;
		y = isTouchDevice ? event.changedTouches[0].clientY : event.clientY;

		node.dispatchEvent(
			new CustomEvent("panend", {
				detail: { x, y },
			})
		);

		window.removeEventListener(
			isTouchDevice ? "touchmove" : "mousemove",
			handleMove
		);
		window.removeEventListener(
			isTouchDevice ? "touchend" : "mouseup",
			handleUp
		);
	}

	node.addEventListener("mousedown", handleDown);
	node.addEventListener("touchstart", handleDown);

	return {
		destroy() {
			node.removeEventListener("mousedown", handleDown);
			node.removeEventListener("touchstart", handleDown);
		},
	};
}
