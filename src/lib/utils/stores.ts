import { writable } from "svelte/store"
import wip from "$lib/components/windows/wip.svelte"
import about from "$lib/components/windows/about.svelte"

export const windows = writable([
	{
		id: "wip",
		name: "WORK IN PROGRESS",
		content: wip,
		w: 650,
		h: 400,
		x: 10,
		y: 10,
		active: true
	},
	{
		id: "about",
		name: "About",
		content: about,
		w: 650,
		h: 400,
		x: 130,
		y: 170,
		active: true
	}
])
