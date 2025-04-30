// Pannable action: enables dragging (panning) on an element via mouse or touch
export function pannable(element: HTMLElement) {
	let x: number;
	let y: number;
	let isTouchDevice = false;
	let isPanning = false; // State to track if panning is active

	// Handle press or touch start: record initial pointer and bind move/up listeners
	function handleDown(event: MouseEvent | TouchEvent) {
		// If a pan is already in progress, ignore this event
		if (isPanning) {
			return;
		}
		isPanning = true; // Set the state to active panning

		// Determine input type and initial coordinates for panning
		isTouchDevice = event.type === 'touchstart';

		x = isTouchDevice ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
		y = isTouchDevice ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

		element.dispatchEvent(
			new CustomEvent('panstart', {
				detail: { x, y }
			})
		);
		window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handleMove);
		window.addEventListener(isTouchDevice ? 'touchend' : 'mouseup', handleUp);
	}

	// Handle movement during pan: calculate delta values and dispatch 'panmove' events
	function handleMove(event: MouseEvent | TouchEvent) {
		// Ensure panning is still active (although isPanning should theoretically be true here)
		if (!isPanning) {
			return;
		}

		if (isTouchDevice && (event as TouchEvent).touches.length > 1) {
			// ignore multitouch events
			return;
		}

		const currentX = isTouchDevice
			? (event as TouchEvent).touches[0].clientX
			: (event as MouseEvent).clientX;
		const currentY = isTouchDevice
			? (event as TouchEvent).touches[0].clientY
			: (event as MouseEvent).clientY;

		const dx = currentX - x;
		const dy = currentY - y;

		x = currentX;
		y = currentY;

		element.dispatchEvent(
			new CustomEvent('panmove', {
				detail: { dx, dy, x, y }
			})
		);
	}

	// Handle end of pan: dispatch 'panend' event and remove listeners
	function handleUp(event: MouseEvent | TouchEvent) {
		// If we weren't panning (unlikely but for safety), exit
		if (!isPanning) {
			return;
		}

		x = isTouchDevice
			? (event as TouchEvent).changedTouches[0].clientX
			: (event as MouseEvent).clientX;
		y = isTouchDevice
			? (event as TouchEvent).changedTouches[0].clientY
			: (event as MouseEvent).clientY;

		element.dispatchEvent(
			new CustomEvent('panend', {
				detail: { x, y }
			})
		);

		window.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handleMove);
		window.removeEventListener(isTouchDevice ? 'touchend' : 'mouseup', handleUp);

		// Reset the panning state only after removing listeners and dispatching the event
		isPanning = false;
	}

	element.addEventListener('mousedown', handleDown);
	element.addEventListener('touchstart', handleDown);

	// Add cleanup in destroy for safety, even though handleUp should handle removal
	function cleanupListeners() {
		window.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handleMove);
		window.removeEventListener(isTouchDevice ? 'touchend' : 'mouseup', handleUp);
		isPanning = false; // Ensure state is reset if the element is destroyed during a pan
	}

	return {
		destroy() {
			element.removeEventListener('mousedown', handleDown);
			element.removeEventListener('touchstart', handleDown);
			cleanupListeners(); // Call cleanup
		}
	};
}
