<script lang="ts">
	/**
	 * Streak counter plus day-dots. This is the one place brand appears as data
	 * rather than as an action — it marks *your* activity, which is what brand
	 * means in this system.
	 */
	import type { ActivityDay } from '$lib/types';

	interface Props {
		streak: number;
		activity: readonly ActivityDay[];
		days?: number;
	}

	let { streak, activity, days = 14 }: Props = $props();

	const window = $derived(activity.slice(-days));
	const todayKey = $derived(window.at(-1)?.day);
</script>

<div class="streak">
	<p class="streak__count"><span aria-hidden="true">⚡</span> {streak} {streak === 1 ? 'day' : 'days'}</p>
	<div class="streak__dots" role="img" aria-label="{streak}-day streak over the last {days} days">
		{#each window as day (day.day)}
			<span
				class="dot"
				class:is-active={day.active}
				class:is-today={day.day === todayKey}
				title={day.day}
			></span>
		{/each}
	</div>
</div>

<style>
	.streak__count {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin: 0 0 var(--sp-3);
	}

	.streak__dots {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		background: var(--track);
		border: 1px solid var(--border);
	}

	.dot.is-active {
		background: var(--brand);
		border-color: var(--brand);
	}

	.dot.is-today {
		outline: 1px solid var(--focus);
		outline-offset: 1px;
	}
</style>
