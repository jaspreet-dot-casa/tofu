<script lang="ts">
	import '../app.css';
	import StatusLine from '$lib/components/StatusLine.svelte';
	import type { LayoutServerData } from './$types';

	interface Props {
		data: LayoutServerData;
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

<StatusLine streak={data.streak} />

<main>
	{@render children()}
</main>

<footer class="foot">
	<div class="foot__inner">
		<p>
			Independent study material for the Claude Certified Architect – Foundations exam. Not
			affiliated with Anthropic — the <a
				href="https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification"
				rel="noreferrer">official exam guide</a
			> is the source of truth.
		</p>
		<a href="/profile">profile &amp; sync</a>
	</div>
</footer>

<style>
	main {
		min-height: calc(100vh - 48px - 90px);
	}

	.foot {
		border-top: 1px solid var(--border);
		background: var(--bg-1);
	}

	.foot__inner {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: var(--sp-5);
		display: flex;
		gap: var(--sp-4);
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		font-size: var(--fs-small);
		color: var(--text-3);
	}

	.foot__inner p {
		margin: 0;
		max-width: 70ch;
		font-weight: 600;
	}

	.foot__inner a {
		white-space: nowrap;
	}
</style>
