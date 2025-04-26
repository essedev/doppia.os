import { windowsStore } from './stores';

export function resizable(element: HTMLElement) {
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

	grabbers.forEach((grabber) => {
		element.appendChild(grabber);
		grabber.addEventListener('mousedown', onMousedown);
	});

	function onMousedown(event: MouseEvent) {
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

	function onMouseup(event: MouseEvent) {
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

	function onMove(event: MouseEvent) {
		if (!active) return;

		const direction = active.dataset.direction;
		let delta;

		if (direction?.match('east')) {
			delta = event.pageX - initialPos?.x;
			const newWidth = initialRect?.width + delta;
			if (newWidth >= 300) {
				element.style.width = `${newWidth}px`;
			}
		}

		if (direction?.match('west')) {
			delta = initialPos?.x - event.pageX;
			const newWidth = initialRect?.width + delta;
			if (newWidth >= 300) {
				element.style.left = `${initialRect?.left - delta}px`;
				element.style.width = `${newWidth}px`;
			}
		}

		if (direction?.match('north')) {
			delta = initialPos?.y - event.pageY;
			const newHeight = initialRect?.height + delta;
			if (newHeight >= 200) {
				element.style.top = `${initialRect?.top - delta}px`;
				element.style.height = `${newHeight}px`;
			}
		}

		if (direction?.match('south')) {
			delta = event.pageY - initialPos?.y;
			const newHeight = initialRect?.height + delta;
			if (newHeight >= 200) {
				element.style.height = `${newHeight}px`;
			}
		}
	}

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onMouseup);

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mousemove', onMousedown);

			grabbers.forEach((grabber) => {
				element.removeChild(grabber);
			});
		}
	};
}
