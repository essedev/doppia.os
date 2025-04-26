import about from '$lib/components/windows/about.svelte';
import contact from '$lib/components/windows/contact.svelte';
import projects from '$lib/components/windows/projects.svelte';
import wip from '$lib/components/windows/wip.svelte';
import type { Component } from 'svelte';
import { writable } from 'svelte/store';

type window = {
	id: string;
	name: string;
	content: Component;
	w: number;
	h: number;
	pos: { x: number; y: number; z: number };
	active: boolean;
};

const windows: window[] = [
	{
		id: 'wip',
		name: 'WORK IN PROGRESS',
		content: wip,
		w: 650,
		h: 400,
		pos: { x: 20, y: 70, z: 10 },
		active: true
	},
	{
		id: 'about',
		name: 'About',
		content: about,
		w: 650,
		h: 400,
		pos: { x: 130, y: 170, z: 10 },
		active: false
	},
	{
		id: 'projects',
		name: 'Projects',
		content: projects,
		w: 650,
		h: 400,
		pos: { x: 130, y: 170, z: 10 },
		active: false
	},
	{
		id: 'contact',
		name: 'Contact',
		content: contact,
		w: 650,
		h: 400,
		pos: { x: 130, y: 170, z: 10 },
		active: false
	}
];

export const windowsStore = writable(windows);
