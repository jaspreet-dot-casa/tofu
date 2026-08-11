<script lang="ts">
	import CardSession from '$lib/components/CardSession.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Flashcards — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header class="deckhead">
		<div>
			<p class="eyebrow">Flashcards</p>
			<h1 class="page-title">{data.domain ? data.domain.title : 'All domains'}</h1>
		</div>
		<p class="deckhead__stats mono">
			{data.stats.due} due · {data.stats.unseen} new · {data.stats.total} total
		</p>
	</header>

	<nav class="decks" aria-label="Decks">
		<a class="deckchip" class:is-active={!data.domain} href="/cards">All</a>
		{#each data.decks as deck (deck.id)}
			<a
				class="deckchip"
				class:is-active={data.domain?.id === deck.id}
				href="/cards?domain={deck.id}"
				style="--dc: var(--{deck.accent})"
			>
				{deck.code}
				<span class="deckchip__n mono">{deck.due + deck.unseen}</span>
			</a>
		{/each}
	</nav>

	<!-- Switching deck starts a new session. The session component owns its own
	     state, so keying it actually resets it — keying a plain markup block would
	     not have reset state declared in this file's script. -->
	{#key data.domain?.id ?? 'all'}
		<CardSession cards={data.cards} />
	{/key}
</div>

<style>
	.deckhead {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
	}

	.deckhead__stats {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: 0;
	}

	.decks {
		display: flex;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}

	.deckchip {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.06em;
		border: 1px solid var(--border);
		border-radius: var(--r-pill);
		padding: 4px 12px;
		text-decoration: none;
		color: var(--text-2);
		transition: border-color var(--dur-1) var(--ease-std);
	}

	.deckchip:hover {
		border-color: var(--border-strong);
		color: var(--text-1);
	}

	.deckchip.is-active {
		border-color: var(--dc, var(--brand));
		color: var(--dc, var(--brand));
		background: var(--bg-2);
	}

	.deckchip__n {
		color: var(--text-3);
	}
</style>
