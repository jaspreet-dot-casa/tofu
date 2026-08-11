<script lang="ts">
	/**
	 * The three glyphs the font subset cannot supply.
	 *
	 * JetBrains Mono carries every other symbol the UI uses (arrows, box drawing,
	 * geometric shapes, ⚡, ⚠), but has no flag (U+2691) or half-circle (U+25D0/1).
	 * Rather than pull in a second symbol font for three shapes, they are drawn.
	 */
	interface Props {
		name: 'flag' | 'theme';
		size?: number;
	}

	let { name, size = 14 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 16 16"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'flag'}
		<path d="M4 14V2.5" />
		<path d="M4 3h7.5l-1.6 2.6L11.5 8.5H4z" fill="currentColor" stroke="none" />
	{:else}
		<!-- Half-filled circle: the classic light/dark toggle mark. -->
		<circle cx="8" cy="8" r="6" />
		<path d="M8 2a6 6 0 0 0 0 12z" fill="currentColor" stroke="none" />
	{/if}
</svg>
