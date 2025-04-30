// Resizable action: adds resize handles (grabbers) to an element, enabling it to be resized by dragging its edges and corners

export function resizable(element: HTMLElement, options: { disabled?: boolean } = {}) {
	// Constant minimum dimensions
	const MIN_WIDTH = 300;
	const MIN_HEIGHT = 200;

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

	// Local reactive variable to track disabled state
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
		if (!active || isDisabled || !initialRect || !initialPos) return;

		const direction = active.dataset.direction;
		let hasChanged = false;

		// Initialize dimensions and position from the element or initial values
		let newWidth = parseInt(element.style.width, 10) || initialRect.width || 0;
		let newHeight = parseInt(element.style.height, 10) || initialRect.height || 0;
		let newLeft = parseInt(element.style.left, 10) || initialRect.left || 0;
		let newTop = parseInt(element.style.top, 10) || initialRect.top || 0;

		// Calculate deltas for each direction
		const deltaX = event.pageX - initialPos.x;
		const deltaY = event.pageY - initialPos.y;

		let widthChanged = false;
		let heightChanged = false;

		// Handle horizontal resizing (east/right)
		if (direction?.match('east')) {
			const proposedWidth = initialRect.width + deltaX;
			if (proposedWidth >= MIN_WIDTH) {
				newWidth = proposedWidth;
				widthChanged = true;
				hasChanged = true;
			}
		}

		// Handle horizontal resizing (west/left)
		if (direction?.match('west')) {
			const proposedWidth = initialRect.width - deltaX;
			if (proposedWidth >= MIN_WIDTH) {
				newWidth = proposedWidth;
				newLeft = initialRect.left + deltaX;
				widthChanged = true;
				hasChanged = true;
			}
		}

		// Handle vertical resizing (north/top)
		if (direction?.match('north')) {
			const proposedHeight = initialRect.height - deltaY;
			if (proposedHeight >= MIN_HEIGHT) {
				newHeight = proposedHeight;
				newTop = initialRect.top + deltaY;
				heightChanged = true;
				hasChanged = true;
			}
		}

		// Handle vertical resizing (south/bottom)
		if (direction?.match('south')) {
			const proposedHeight = initialRect.height + deltaY;
			if (proposedHeight >= MIN_HEIGHT) {
				newHeight = proposedHeight;
				heightChanged = true;
				hasChanged = true;
			}
		}

		// Apply changes only if dimensions have changed and respect minimum limits
		if (hasChanged) {
			// Apply width changes
			if (widthChanged) {
				element.style.width = `${newWidth}px`;
				if (direction?.match('west')) {
					element.style.left = `${newLeft}px`;
				}
			}

			// Apply height changes
			if (heightChanged) {
				element.style.height = `${newHeight}px`;
				if (direction?.match('north')) {
					element.style.top = `${newTop}px`;
				}
			}

			// Dispatch resizing event
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

			// Update options variable
			options = newOptions;

			// If state has changed, update grabbers
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
