<script lang="ts">
	/**
	 * The Score Rail — the signature instrument.
	 *
	 * Two fused parts. The slots row gives every domain a cell whose width IS its
	 * exam weight (27/20/20/18/15), filled to the points it currently contributes;
	 * the gap between fill and cell edge is exactly what that domain is leaving on
	 * the table. The strip below maps 100→1000 with the 720 pass line drawn across
	 * it. Never equalise the slot widths for tidiness — the weights are the point.
	 */
	import { PASS_SCORE, SCORE_CEILING, SCORE_FLOOR, SCORE_RANGE } from '$lib/data/domains';
	import type { RailSegment } from '$lib/types';
	import { percent } from '$lib/format';

	interface Props {
		score: number;
		/** DomainReadiness satisfies this structurally, so the dashboard just passes it. */
		domains: readonly RailSegment[];
		label: string;
		/** Optional caveat rendered under the rail. */
		note?: string;
	}

	let { score, domains, label, note }: Props = $props();

	const passed = $derived(score >= PASS_SCORE);
	const delta = $derived(Math.abs(score - PASS_SCORE));
	const scorePct = $derived(((score - SCORE_FLOOR) / SCORE_RANGE) * 100);
	const passPct = ((PASS_SCORE - SCORE_FLOOR) / SCORE_RANGE) * 100;

	const description = $derived(
		`${label}: ${score} of ${SCORE_CEILING}; ` +
			`${PASS_SCORE} needed to pass; ${passed ? `${delta} points clear` : `${delta} points short`}. ` +
			domains.map((d) => `${d.domain.code} ${d.points} of ${d.ceiling}`).join('; ') +
			'.'
	);
</script>

<section class="rail" role="img" aria-label={description}>
	<div class="rail__readout">
		<div>
			<p class="eyebrow">{label}</p>
			<p class="rail__score" class:is-pass={passed} class:is-fail={!passed}>{score}</p>
		</div>
		<p class="rail__delta" class:is-pass={passed} class:is-fail={!passed}>
			{#if passed}
				<span aria-hidden="true">▲</span> {delta} clear of the line
			{:else}
				<span aria-hidden="true">▼</span> {delta} below the line
			{/if}
		</p>
	</div>

	<div class="rail__slots">
		{#each domains as entry (entry.domain.id)}
			<div class="slot" style="--dc: var(--{entry.domain.accent}); --w: {entry.domain.weight}%">
				<div class="slot__head">
					<span class="slot__code">{entry.domain.code}</span>
					<span class="slot__pts">{entry.points}/{entry.ceiling}</span>
				</div>
				<div class="slot__track">
					<div
						class="slot__fill"
						style="width: {percent(entry.points, entry.ceiling)}%"
					></div>
				</div>
			</div>
		{/each}
	</div>

	<div class="rail__strip">
		<div class="strip">
			<div
				class="strip__fill"
				class:is-pass={passed}
				class:is-fail={!passed}
				style="width: {Math.max(0, Math.min(100, scorePct))}%"
			></div>
			<div class="strip__passline" style="left: {passPct}%">
				<span class="strip__flag">{PASS_SCORE} · pass</span>
			</div>
			<div
				class="strip__marker"
				class:is-pass={passed}
				class:is-fail={!passed}
				style="left: {Math.max(0, Math.min(100, scorePct))}%"
			></div>
		</div>
		<div class="strip__scale">
			<span>{SCORE_FLOOR}</span>
			<span>{SCORE_CEILING}</span>
		</div>
	</div>

	{#if note}
		<p class="rail__note prose-note">{note}</p>
	{/if}
</section>

<style>
	.rail {
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		padding: var(--sp-5);
	}

	.rail__readout {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
		margin-bottom: var(--sp-5);
	}

	.rail__score {
		font-family: var(--font-mono);
		font-size: var(--fs-score);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.rail__score.is-pass {
		color: var(--pass);
	}
	.rail__score.is-fail {
		color: var(--fail);
	}

	.rail__delta {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		margin: 0 0 var(--sp-2);
	}

	.rail__delta.is-pass {
		color: var(--pass);
	}
	.rail__delta.is-fail {
		color: var(--fail);
	}

	/* Slot widths ARE the exam weights. */
	.rail__slots {
		display: flex;
		gap: var(--sp-2);
		margin-bottom: var(--sp-5);
	}

	.slot {
		width: var(--w);
		min-width: 0;
	}

	/* Code and points sit together at the LEFT of their own slot. With
	   space-between, a wide slot pushes them to opposite ends and the points read
	   as belonging to the next domain along. */
	.slot__head {
		display: flex;
		align-items: baseline;
		gap: var(--sp-2);
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		margin-bottom: var(--sp-2);
		white-space: nowrap;
		overflow: hidden;
	}

	.slot__code {
		color: var(--dc);
		letter-spacing: 0.06em;
	}

	.slot__pts {
		color: var(--text-3);
	}

	.slot__track {
		height: 10px;
		border-radius: var(--r-pill);
		background: var(--track);
		border: 1px solid var(--border);
		overflow: hidden;
	}

	.slot__fill {
		height: 100%;
		background: var(--dc);
		border-radius: var(--r-pill);
		transition: width var(--dur-rail) var(--ease-std);
	}

	.strip {
		position: relative;
		height: 12px;
		border-radius: var(--r-pill);
		background: var(--track);
		border: 1px solid var(--border);
		margin-top: var(--sp-6);
	}

	.strip__fill {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: var(--r-pill);
		transition: width var(--dur-rail) var(--ease-std);
	}

	.strip__fill.is-pass {
		background: var(--pass);
	}
	.strip__fill.is-fail {
		background: var(--fail);
	}

	.strip__passline {
		position: absolute;
		top: -6px;
		bottom: -6px;
		width: 2px;
		background: var(--text-1);
	}

	.strip__flag {
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-1);
		white-space: nowrap;
	}

	.strip__marker {
		position: absolute;
		top: 50%;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 3px solid var(--bg-1);
		transform: translate(-50%, -50%);
		transition: left var(--dur-rail) var(--ease-std);
	}

	.strip__marker.is-pass {
		background: var(--pass);
	}
	.strip__marker.is-fail {
		background: var(--fail);
	}

	.strip__scale {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
		margin-top: var(--sp-2);
		font-variant-numeric: tabular-nums;
	}

	.rail__note {
		margin: var(--sp-5) 0 0;
	}

	/* Narrow: drop the per-slot points, keep the D-codes and the proportions. */
	@media (max-width: 560px) {
		.slot__pts {
			display: none;
		}
		.rail__readout {
			display: block;
		}
		.rail__delta {
			margin-top: var(--sp-2);
		}
	}
</style>
