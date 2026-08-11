<script lang="ts">
	/**
	 * Finished papers, most recent first. Rendered identically on the dashboard and
	 * the practice page — they used to carry separate copies of this markup and CSS,
	 * and the copies had already drifted (only one of them had a hover state).
	 */
	import type { AttemptSummary } from '$lib/types';

	interface Props {
		attempts: readonly AttemptSummary[];
	}

	let { attempts }: Props = $props();
</script>

<ul class="history list-reset">
	{#each attempts as attempt (attempt.id)}
		<li>
			<a href="/quiz/{attempt.id}/result">
				<span class="history__score" class:is-pass={attempt.passed}>{attempt.score ?? '—'}</span>
				<span class="history__mode">{attempt.label}</span>
				<span class="chip {attempt.passed ? 'chip--ok' : 'chip--err'}"
					>{attempt.passed ? 'pass' : 'below'}</span
				>
			</a>
		</li>
	{/each}
</ul>

<style>
	.history li + li {
		border-top: 1px solid var(--border);
	}

	.history a {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		padding: var(--sp-3) 0;
		text-decoration: none;
		color: var(--text-1);
	}

	.history a:hover .history__mode {
		color: var(--brand);
	}

	.history__score {
		font-family: var(--font-mono);
		font-size: var(--fs-h3);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--fail);
		min-width: 3.5ch;
	}

	.history__score.is-pass {
		color: var(--pass);
	}

	.history__mode {
		font-size: var(--fs-small);
		margin-right: auto;
		text-transform: capitalize;
		transition: color var(--dur-1) var(--ease-std);
	}
</style>
