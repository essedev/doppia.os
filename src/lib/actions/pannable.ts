// Pannable action: enables dragging (panning) on an element via mouse or touch
export function pannable(element: HTMLElement) {
	let x: number;
	let y: number;
	let isTouchDevice = false;

	// Handle press or touch start: record initial pointer and bind move/up listeners
	function handleDown(event: MouseEvent | TouchEvent) {
		// Determine input type and initial coordinates for panning
		isTouchDevice = event.type === 'touchstart';

		x = isTouchDevice ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
		y = isTouchDevice ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

		element.dispatchEvent(new CustomEvent('panstart'));

		window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handleMove);
		window.addEventListener(isTouchDevice ? 'touchend' : 'mouseup', handleUp);
	}

	// Handle movement during pan: calculate delta values and dispatch 'panmove' events
	function handleMove(event: MouseEvent | TouchEvent) {
		if (isTouchDevice && (event as TouchEvent).touches.length > 1) {
			// ignore multitouch events
			return;
		}

		const dx =
			(isTouchDevice ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX) -
			x;
		const dy =
			(isTouchDevice ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY) -
			y;

		x = isTouchDevice ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
		y = isTouchDevice ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

		element.dispatchEvent(
			new CustomEvent('panmove', {
				detail: { dx, dy }
			})
		);
	}

	// Handle end of pan: dispatch 'panend' event and remove listeners
	function handleUp(event: MouseEvent | TouchEvent) {
		x = isTouchDevice
			? (event as TouchEvent).changedTouches[0].clientX
			: (event as MouseEvent).clientX;
		y = isTouchDevice
			? (event as TouchEvent).changedTouches[0].clientY
			: (event as MouseEvent).clientY;

		element.dispatchEvent(new CustomEvent('panend'));

		window.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handleMove);
		window.removeEventListener(isTouchDevice ? 'touchend' : 'mouseup', handleUp);
	}

	element.addEventListener('mousedown', handleDown);
	element.addEventListener('touchstart', handleDown);

	return {
		destroy() {
			element.removeEventListener('mousedown', handleDown);
			element.removeEventListener('touchstart', handleDown);
		}
	};
} 