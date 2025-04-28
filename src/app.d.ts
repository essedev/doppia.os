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
			onpanstart?: CompositionEventHandler<T>;
			onpanmove?: CompositionEventHandler<T>;
			onpanend?: CompositionEventHandler<T>;
			onresized?: CompositionEventHandler<T>;
		}
	}
}

export { };

