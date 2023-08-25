// app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	declare namespace svelteHTML {
		interface HTMLAttributes<T> {
			"on:panstart"?: CompositionEventHandler<T>
			"on:panmove"?: CompositionEventHandler<T>
			"on:panend"?: CompositionEventHandler<T>
			"on:resized"?: CompositionEventHandler<T>
		}
	}
}

export {}
