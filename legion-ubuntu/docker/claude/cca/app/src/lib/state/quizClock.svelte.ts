/**
 * The mock-exam countdown, hoisted out of the quiz route so the status line can
 * render it. Drill mode never starts it — there is no clock in drill mode, by
 * design, and `remainingMs` stays null.
 */

class QuizClock {
	remainingMs = $state<number | null>(null);

	#timer: ReturnType<typeof setInterval> | null = null;
	#deadline = 0;

	/** Begins counting to `deadline`. Safe to call repeatedly with the same value. */
	start(deadline: Date): void {
		const target = deadline.getTime();
		if (this.#timer && this.#deadline === target) return;

		this.stop();
		this.#deadline = target;
		this.#tick();
		this.#timer = setInterval(() => this.#tick(), 1000);
	}

	stop(): void {
		if (this.#timer) clearInterval(this.#timer);
		this.#timer = null;
		this.remainingMs = null;
	}

	#tick(): void {
		const left = this.#deadline - Date.now();
		this.remainingMs = Math.max(0, left);
		if (left <= 0 && this.#timer) {
			clearInterval(this.#timer);
			this.#timer = null;
		}
	}

	get expired(): boolean {
		return this.remainingMs !== null && this.remainingMs <= 0;
	}
}

export const quizClock = new QuizClock();
