import { writable } from "svelte/store"
import type { SvelteComponent, ComponentType } from "svelte"
import wip from "$lib/components/windows/wip.svelte"
import about from "$lib/components/windows/about.svelte"

type window = {
	id: string
	name: string
	content: ComponentType<SvelteComponent>
	w: number
	h: number
	x: number
	y: number
	active: boolean
}

const windows: window[] = [
	{
		id: "wip",
		name: "WORK IN PROGRESS",
		content: wip,
		w: 650,
		h: 400,
		x: 10,
		y: 60,
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
		active: false
	}
]

export const windowsStore = writable(windows)
