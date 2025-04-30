import { SnapType } from '$lib/actions/snap';
import about from '$lib/components/windows/about.svelte';
import contact from '$lib/components/windows/contact.svelte';
import photopea from '$lib/components/windows/photopea.svelte';
import projects from '$lib/components/windows/projects.svelte';
import wip from '$lib/components/windows/wip.svelte';
import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export type WindowData = {
	id: string;
	name: string;
	content: Component;
	w: number;
	h: number;
	pos: { x: number; y: number; z: number };
	active: boolean;
	isMinimized: boolean;
	isMaximized: boolean;
	isPreview?: boolean;
	previewFor?: string;
	snapType?: SnapType;
	previousSize?: { w: number; h: number; pos: { x: number; y: number } };
};

const windows: WindowData[] = [
	{
		id: 'wip',
		name: 'WORK IN PROGRESS',
		content: wip,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: true,
		isMinimized: false,
		isMaximized: false
	},
	{
		id: 'about',
		name: 'About',
		content: about,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: false,
		isMinimized: false,
		isMaximized: false
	},
	{
		id: 'projects',
		name: 'Projects',
		content: projects,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: false,
		isMinimized: false,
		isMaximized: false
	},
	{
		id: 'contact',
		name: 'Contact',
		content: contact,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: false,
		isMinimized: false,
		isMaximized: false
	},
	{
		id: 'photopea',
		name: 'Photopea',
		content: photopea,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: false,
		isMinimized: false,
		isMaximized: false
	}
];

export const windowsStore = writable(windows);
