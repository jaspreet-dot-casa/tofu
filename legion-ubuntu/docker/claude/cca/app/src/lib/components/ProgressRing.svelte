<script lang="ts">
	/** Small completion ring for curriculum cards. */
	interface Props {
		value: number;
		size?: number;
		accent?: string;
	}

	import { clampRatio } from '$lib/format';

	let { value, size = 44, accent = 'brand' }: Props = $props();

	const stroke = 4;
	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const pct = $derived(clampRatio(value));
	const label = $derived(Math.round(pct * 100));
</script>

<svg
	class="ring"
	width={size}
	height={size}
	viewBox="0 0 {size} {size}"
	role="img"
	aria-label="{label}% complete"
>
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke="var(--track)"
		stroke-width={stroke}
	/>
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke="var(--{accent})"
		stroke-width={stroke}
		stroke-linecap="round"
		stroke-dasharray="{circumference * pct} {circumference}"
		transform="rotate(-90 {size / 2} {size / 2})"
	/>
	<text x="50%" y="50%" dy="0.35em" text-anchor="middle">{label}</text>
</svg>

<style>
	.ring {
		flex: none;
	}

	text {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		fill: var(--text-2);
		font-variant-numeric: tabular-nums;
	}

	circle {
		transition: stroke-dasharray var(--dur-2) var(--ease-std);
	}
</style>
