// Resizable action: adds resize handles (grabbers) to an element, enabling it to be resized by dragging its edges and corners

export function resizable(element: HTMLElement, options: { disabled?: boolean } = {}) {
	const right = document.createElement('div');
	right.dataset.direction = 'east';
	right.classList.add('grabber');
	right.classList.add('right');

	const left = document.createElement('div');
	left.dataset.direction = 'west';
	left.classList.add('grabber');
	left.classList.add('left');

	const top = document.createElement('div');
	top.dataset.direction = 'north';
	top.classList.add('grabber');
	top.classList.add('top');

	const bottom = document.createElement('div');
	bottom.dataset.direction = 'south';
	bottom.classList.add('grabber');
	bottom.classList.add('bottom');

	const topLeft = document.createElement('div');
	topLeft.dataset.direction = 'northwest';
	topLeft.classList.add('grabber');
	topLeft.classList.add('top-left');

	const topRight = document.createElement('div');
	topRight.dataset.direction = 'northeast';
	topRight.classList.add('grabber');
	topRight.classList.add('top-right');

	const bottomLeft = document.createElement('div');
	bottomLeft.dataset.direction = 'southwest';
	bottomLeft.classList.add('grabber');
	bottomLeft.classList.add('bottom-left');

	const bottomRight = document.createElement('div');
	bottomRight.dataset.direction = 'southeast';
	bottomRight.classList.add('grabber');
	bottomRight.classList.add('bottom-right');

	const grabbers = [right, left, top, bottom, topLeft, topRight, bottomLeft, bottomRight];

	let active: HTMLElement | null = null,
		initialRect: {
			width: any;
			left: any;
			top: any;
			height: any;
			right?: number;
			bottom?: number;
		} | null = null,
		initialPos: { x: any; y: any } | null = null;

	// Variabile reattiva locale per tenere traccia dello stato disabled
	let isDisabled = !!options.disabled;

	// Create and append resize grabbers for all eight directions
	grabbers.forEach((grabber) => {
		element.appendChild(grabber);
		grabber.addEventListener('mousedown', onMousedown);
	});

	// Update grabber visibility based on disabled status
	function updateGrabbers(disabled = false) {
		isDisabled = disabled;

		grabbers.forEach((grabber) => {
			// Use CSS display property to control visibility
			grabber.style.display = disabled ? 'none' : 'block';

			// For additional safety, also add/remove a disabled class
			if (disabled) {
				grabber.classList.add('disabled');
			} else {
				grabber.classList.remove('disabled');
			}
		});
	}

	// Initial setting of visibility
	updateGrabbers(options.disabled);

	// Handle mouse down on a grabber: store active handle and initial dimensions and pointer position
	function onMousedown(event: MouseEvent) {
		// Early return if resizing is disabled
		if (isDisabled) {
			return;
		}

		active = event.target as HTMLElement;
		const rect = element.getBoundingClientRect();
		const parent = element.parentElement?.getBoundingClientRect();
		if (!parent) return;

		initialRect = {
			width: rect.width,
			height: rect.height,
			left: rect.left - parent.left,
			right: parent.right - rect.right,
			top: rect.top - parent.top,
			bottom: parent.bottom - rect.bottom
		};
		initialPos = { x: event.pageX, y: event.pageY };
	}

	// Handle mouse up: dispatch 'resized' event with new dimensions and clear active state
	function onMouseup() {
		if (!active) return;

		element.dispatchEvent(
			new CustomEvent('resized', {
				detail: {
					w: parseInt(element.style.width, 10),
					h: parseInt(element.style.height, 10),
					x: parseInt(element.style.left, 10),
					y: parseInt(element.style.top, 10)
				}
			})
		);

		active = null;
		initialRect = null;
		initialPos = null;
	}

	// Handle mouse move: update element size and position according to drag direction
	function onMove(event: MouseEvent) {
		// Return immediately if no active grabber or if resizing is disabled
		if (!active || isDisabled) return;

		const direction = active.dataset.direction;
		let delta;
		let hasChanged = false;
		let newWidth, newHeight, newLeft, newTop;

		newLeft = parseInt(element.style.left, 10) || initialRect?.left || 0;
		newTop = parseInt(element.style.top, 10) || initialRect?.top || 0;
		newWidth = parseInt(element.style.width, 10) || initialRect?.width || 0;
		newHeight = parseInt(element.style.height, 10) || initialRect?.height || 0;

		if (direction?.match('east')) {
			delta = event.pageX - initialPos?.x;
			newWidth = initialRect?.width + delta;
			if (newWidth >= 300) {
				element.style.width = `${newWidth}px`;
				hasChanged = true;
			}
		}

		if (direction?.match('west')) {
			delta = initialPos?.x - event.pageX;
			newWidth = initialRect?.width + delta;
			if (newWidth >= 300) {
				newLeft = initialRect?.left - delta;
				element.style.left = `${newLeft}px`;
				element.style.width = `${newWidth}px`;
				hasChanged = true;
			}
		}

		if (direction?.match('north')) {
			delta = initialPos?.y - event.pageY;
			newHeight = initialRect?.height + delta;
			if (newHeight >= 200) {
				newTop = initialRect?.top - delta;
				element.style.top = `${newTop}px`;
				element.style.height = `${newHeight}px`;
				hasChanged = true;
			}
		}

		if (direction?.match('south')) {
			delta = event.pageY - initialPos?.y;
			newHeight = initialRect?.height + delta;
			if (newHeight >= 200) {
				element.style.height = `${newHeight}px`;
				hasChanged = true;
			}
		}

		// If dimensions changed, dispatch real-time resizing event
		if (hasChanged) {
			element.dispatchEvent(
				new CustomEvent('resizing', {
					detail: {
						w: newWidth,
						h: newHeight,
						x: newLeft,
						y: newTop
					}
				})
			);
		}
	}

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onMouseup);

	return {
		update(newOptions: { disabled?: boolean } = {}) {
			const wasDisabled = isDisabled;
			const nowDisabled = !!newOptions.disabled;

			// Aggiorniamo la variabile delle opzioni
			options = newOptions;

			// Se lo stato è cambiato, aggiorniamo i grabber
			if (wasDisabled !== nowDisabled) {
				updateGrabbers(nowDisabled);

				// Clear any active resizing when window is maximized
				if (nowDisabled && active) {
					active = null;
					initialRect = null;
					initialPos = null;
				}
			}
		},
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseup);

			grabbers.forEach((grabber) => {
				grabber.removeEventListener('mousedown', onMousedown);
				if (element.contains(grabber)) {
					element.removeChild(grabber);
				}
			});
		}
	};
}
