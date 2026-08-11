<script lang="ts">
	/**
	 * tmux-style status line. Present on every screen: wordmark, sections, and a
	 * right-hand instrument cluster. During a mock exam the clock slot is taken over
	 * by the countdown — drill mode has no clock anywhere, deliberately.
	 */
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { formatDuration } from '$lib/format';

	interface Props {
		streak: number;
		cardsDue: number;
		/** Milliseconds remaining; only ever set during a mock exam. */
		countdownMs?: number | null;
	}

	let { streak, cardsDue, countdownMs = null }: Props = $props();

	const SECTIONS = [
		{ href: '/', label: 'dashboard' },
		{ href: '/curriculum', label: 'curriculum' },
		{ href: '/quiz', label: 'quiz' },
		{ href: '/cards', label: 'cards' },
		{ href: '/resources', label: 'resources' }
	];

	let theme = $state<'dark' | 'light'>('dark');

	$effect(() => {
		theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
	});

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('cca-theme', theme);
		} catch {
			/* private mode — the choice just does not persist */
		}
	}

	function isActive(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	const clock = $derived.by(() => {
		if (countdownMs === null) return null;
		const total = Math.max(0, Math.floor(countdownMs / 1000));
		return { text: formatDuration(total), urgent: total < 300, warn: total < 1200 };
	});
</script>

<header class="statusline">
	<div class="statusline__inner">
		<a class="wordmark" href="/">CCA<span>·</span>PREP</a>

		<nav class="sections" aria-label="Sections">
			{#each SECTIONS as section (section.href)}
				<a
					href={section.href}
					class="section"
					class:is-active={isActive(section.href)}
					aria-current={isActive(section.href) ? 'page' : undefined}>{section.label}</a
				>
			{/each}
		</nav>

		<div class="cluster">
			{#if clock}
				<span
					class="clock"
					class:is-warn={clock.warn && !clock.urgent}
					class:is-urgent={clock.urgent}
					aria-label="Time remaining {clock.text}">{clock.text}</span
				>
			{:else}
				{#if streak > 0}
					<span class="stat" title="Study streak"
						><span aria-hidden="true">⚡</span> {streak}d</span
					>
				{/if}
				{#if cardsDue > 0}
					<a class="stat stat--link" href="/cards" title="Cards due">{cardsDue} due</a>
				{/if}
			{/if}

			<button
				class="themebtn"
				class:is-light={theme === 'light'}
				type="button"
				onclick={toggleTheme}
				aria-label="Switch to {theme === 'dark' ? 'light' : 'dark'} theme"
			>
				<Icon name="theme" />
			</button>
		</div>
	</div>
</header>

<style>
	.statusline {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg-1);
		border-bottom: 1px solid var(--border);
	}

	.statusline__inner {
		max-width: var(--maxw);
		margin: 0 auto;
		height: 48px;
		padding: 0 var(--sp-5);
		display: flex;
		align-items: center;
		gap: var(--sp-5);
	}

	.wordmark {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--fs-small);
		letter-spacing: 0.06em;
		color: var(--text-1);
		text-decoration: none;
		white-space: nowrap;
	}

	.wordmark span {
		color: var(--brand);
	}

	.sections {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		margin-right: auto;
		min-width: 0;
		overflow: hidden;
	}

	.section {
		position: relative;
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		letter-spacing: 0.04em;
		color: var(--text-2);
		text-decoration: none;
		line-height: 48px;
		transition: color var(--dur-1) var(--ease-std);
	}

	.section:hover {
		color: var(--text-1);
	}

	.section.is-active {
		color: var(--text-1);
	}

	.section.is-active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: var(--brand);
	}

	.cluster {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		margin-left: auto;
	}

	.stat {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-variant-numeric: tabular-nums;
		color: var(--text-2);
		white-space: nowrap;
	}

	.stat--link {
		text-decoration: none;
	}

	.stat--link:hover {
		color: var(--brand);
	}

	.clock {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		background: var(--bg-2);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		padding: 2px 10px;
		color: var(--text-1);
	}

	.clock.is-warn {
		background: var(--flag-soft);
		border-color: var(--flag);
		color: var(--flag-ink);
	}

	.clock.is-urgent {
		background: var(--err-soft);
		border-color: var(--err);
		color: var(--err);
	}

	.themebtn {
		display: grid;
		place-items: center;
		background: none;
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		color: var(--text-2);
		cursor: pointer;
		width: 30px;
		height: 26px;
		padding: 0;
		transition:
			color var(--dur-1) var(--ease-std),
			border-color var(--dur-1) var(--ease-std);
	}

	/* Flip the filled half so the mark tracks the active theme. */
	.themebtn.is-light :global(svg) {
		transform: rotate(180deg);
	}

	.themebtn:hover {
		color: var(--text-1);
		border-color: var(--border-strong);
	}

	/* Under 640px the middle section hides; in-page navigation takes over. */
	@media (max-width: 640px) {
		.statusline__inner {
			padding: 0 var(--sp-4);
		}
		.sections {
			display: none;
		}
	}
</style>
