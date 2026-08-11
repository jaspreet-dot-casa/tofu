<script lang="ts">
	/**
	 * A timestamped jump into the 13-chapter freeCodeCamp course. One quiet row that
	 * sits inside prose without shouting — a link styled like a fine tool, never an
	 * embedded player and never a thumbnail.
	 */
	interface Props {
		title: string;
		timestamp: string;
		url: string;
		number: number;
	}

	let { title, timestamp, url, number }: Props = $props();
</script>

<a class="video-link" href={url} target="_blank" rel="noreferrer">
	<span class="video-link__play" aria-hidden="true">▶</span>
	<span class="video-link__title">{title}</span>
	<span class="video-link__ts">{timestamp}</span>
	<span class="video-link__src">fCC · ch {number}</span>
</a>

<style>
	.video-link {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		padding: var(--sp-3) var(--sp-4);
		text-decoration: none;
		color: var(--text-1);
		transition: border-color var(--dur-1) var(--ease-std);
	}

	.video-link:hover {
		border-color: var(--border-strong);
		color: var(--text-1);
	}

	.video-link__play {
		color: var(--brand);
		font-size: var(--fs-small);
		transition: transform var(--dur-1) var(--ease-std);
	}

	.video-link:hover .video-link__play {
		transform: translateX(2px);
	}

	.video-link__title {
		font-size: var(--fs-small);
		font-weight: 600;
		margin-right: auto;
		min-width: 0;
	}

	.video-link__ts {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-variant-numeric: tabular-nums;
		background: var(--bg-2);
		border: 1px solid var(--border);
		border-radius: var(--r-pill);
		padding: 2px 8px;
		white-space: nowrap;
	}

	.video-link__src {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-3);
		white-space: nowrap;
	}

	@media (max-width: 560px) {
		.video-link__src {
			display: none;
		}
	}
</style>
