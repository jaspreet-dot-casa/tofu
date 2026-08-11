<script lang="ts">
	/**
	 * A per-domain progress row.
	 *
	 * On desktop the TRACK width is proportional to the domain's exam weight (D1 is
	 * the reference at 100%, so D5's whole track is visibly just over half of it) —
	 * the weights are felt, not only printed. Below 760px a 15% track is unreadable,
	 * so every track snaps to full width and the weight survives in the chip. No
	 * intermediate scaling: proportionality is all-or-nothing.
	 */
	import type { Domain } from '$lib/data/domains';
	import { clampRatio } from '$lib/format';

	interface Props {
		domain: Domain;
		/** 0–1. */
		value: number;
		stats?: string;
		href?: string;
	}

	let { domain, value, stats, href }: Props = $props();

	// D1 at 27% is the reference width.
	const trackWidth = $derived((domain.weight / 27) * 100);
	const pct = $derived(Math.round(clampRatio(value) * 100));
</script>

<div class="meter" style="--dc: var(--{domain.accent}); --trackw: {trackWidth}%">
	<div class="meter__head">
		<span class="meter__code">{domain.code}</span>
		{#if href}
			<a class="meter__name" {href}>{domain.title}</a>
		{:else}
			<span class="meter__name">{domain.title}</span>
		{/if}
		<span class="chip chip--{domain.accent}">{domain.weight}%</span>
	</div>

	<div class="meter__track">
		<div class="meter__fill" style="width: {pct}%"></div>
	</div>

	{#if stats}
		<p class="meter__stats">{stats}</p>
	{/if}
</div>

<style>
	.meter + :global(.meter) {
		margin-top: var(--sp-4);
	}

	.meter__head {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		flex-wrap: wrap;
		margin-bottom: var(--sp-2);
	}

	.meter__code {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--dc);
	}

	.meter__name {
		font-size: var(--fs-small);
		font-weight: 600;
		color: var(--text-1);
		text-decoration: none;
		margin-right: auto;
	}

	a.meter__name:hover {
		color: var(--brand);
	}

	.meter__track {
		width: var(--trackw);
		height: 10px;
		border-radius: var(--r-pill);
		background: var(--track);
		border: 1px solid var(--border);
		overflow: hidden;
	}

	.meter__fill {
		height: 100%;
		background: var(--dc);
		border-radius: var(--r-pill);
		transition: width var(--dur-2) var(--ease-std);
	}

	.meter__stats {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-variant-numeric: tabular-nums;
		color: var(--text-3);
		margin: var(--sp-2) 0 0;
	}

	@media (max-width: 760px) {
		.meter__track {
			width: 100%;
		}
	}
</style>
