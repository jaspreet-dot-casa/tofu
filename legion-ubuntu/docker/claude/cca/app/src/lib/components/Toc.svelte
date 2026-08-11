<script lang="ts">
	/** Sticky contents list for the reader. Hidden below 880px. */
	import type { TocEntry } from '$lib/types';

	interface Props {
		entries: readonly TocEntry[];
	}

	let { entries }: Props = $props();
</script>

{#if entries.length > 1}
	<nav class="toc" aria-label="On this page">
		<p class="eyebrow">On this page</p>
		<ul>
			{#each entries as entry (entry.id)}
				<li class:is-sub={entry.level === 3}>
					<a href="#{entry.id}">{entry.text}</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.toc {
		position: sticky;
		top: 72px;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 1px solid var(--border);
	}

	li {
		padding-left: var(--sp-3);
	}

	li + li {
		margin-top: var(--sp-2);
	}

	li.is-sub {
		padding-left: var(--sp-5);
	}

	a {
		font-size: var(--fs-small);
		font-weight: 600;
		color: var(--text-2);
		text-decoration: none;
		line-height: 1.4;
		display: block;
	}

	a:hover {
		color: var(--text-1);
	}

	@media (max-width: 880px) {
		.toc {
			display: none;
		}
	}
</style>
