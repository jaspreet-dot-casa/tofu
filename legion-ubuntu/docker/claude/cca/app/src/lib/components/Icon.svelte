<script lang="ts">
	/**
	 * The glyphs the font subset cannot supply.
	 *
	 * JetBrains Mono carries every other symbol the UI uses (arrows, box drawing,
	 * geometric shapes, ⚡, ⚠), but has no flag (U+2691) or half-circle (U+25D0/1),
	 * and text-rendered menu/close marks sit off-centre in a square button. Rather
	 * than pull in a second symbol font for a handful of shapes, they are drawn.
	 */
	interface Props {
		name: 'flag' | 'theme' | 'menu' | 'close';
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
	{:else if name === 'menu'}
		<path d="M2.5 4.5h11" />
		<path d="M2.5 8h11" />
		<path d="M2.5 11.5h11" />
	{:else if name === 'close'}
		<path d="M4 4l8 8" />
		<path d="M12 4l-8 8" />
	{:else}
		<!-- Half-filled circle: the classic light/dark toggle mark. -->
		<circle cx="8" cy="8" r="6" />
		<path d="M8 2a6 6 0 0 0 0 12z" fill="currentColor" stroke="none" />
	{/if}
</svg>
