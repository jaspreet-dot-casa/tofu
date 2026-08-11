<script lang="ts">
	import Streak from '$lib/components/Streak.svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let copied = $state(false);

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(data.profileId);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			/* clipboard blocked — the code is selectable in the field anyway */
		}
	}
</script>

<svelte:head>
	<title>Profile — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header>
		<h1 class="page-title">Profile</h1>
		<p class="lede">
			There is no login. Your progress is tied to an anonymous id in a cookie on this device — the
			sync code below. Paste it into another browser to pick up the same history there.
		</p>
	</header>

	{#if form && 'message' in form && form.message}
		<p class="alert alert--err">{form.message}</p>
	{:else if form && 'reset' in form && form.reset}
		<p class="alert alert--ok">History cleared. The sync code is unchanged.</p>
	{/if}

	<div class="cols">
		<section class="card">
			<p class="eyebrow">Sync code</p>
			<div class="code">
				<input class="code__field mono" value={data.profileId} readonly aria-label="Your sync code" />
				<button class="btn btn--secondary btn--sm" type="button" onclick={copyCode}>
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
			<p class="note">
				Anyone with this code can read and change this progress history. It is not a secret worth
				much, but it is not meant for sharing either.
			</p>

			<form method="POST" action="?/adopt" class="adopt">
				<label class="eyebrow" for="code">Use a different profile</label>
				<div class="code">
					<input
						class="code__field mono"
						id="code"
						name="code"
						placeholder="paste a sync code"
						required
					/>
					<button class="btn btn--secondary btn--sm" type="submit">Adopt</button>
				</div>
			</form>
		</section>

		<section class="card">
			<p class="eyebrow">This profile</p>
			<dl class="stats">
				<div>
					<dt>Chapters read</dt>
					<dd class="mono">{data.overall.done}/{data.overall.total}</dd>
				</div>
				<div>
					<dt>Curriculum</dt>
					<dd class="mono">{data.overall.percent}%</dd>
				</div>
			</dl>
			{#if data.stats.createdAt}
				<p class="note">Started {new Date(data.stats.createdAt).toLocaleDateString()}.</p>
			{/if}
		</section>
	</div>

	<section class="card">
		<p class="eyebrow">Last 12 weeks</p>
		<Streak streak={data.streak} activity={data.activity} days={84} />
	</section>

	<section class="card">
		<p class="eyebrow">Data</p>
		<div class="actions">
			<a class="btn btn--secondary btn--sm" href="/profile/export" download>Export as JSON</a>
			<form method="POST" action="?/newProfile">
				<button class="btn btn--secondary btn--sm" type="submit">Start a fresh profile</button>
			</form>
		</div>

		<form method="POST" action="?/reset" class="danger">
			<p class="eyebrow">Erase this profile's history</p>
			<p class="note">
				Deletes every chapter tick, paper, card schedule and activity day for this profile. The sync
				code survives. Type <code>{data.profileId.slice(0, 8)}</code> to confirm.
			</p>
			<div class="code">
				<input class="code__field mono" name="confirm" placeholder="confirm" required />
				<button class="btn btn--danger btn--sm" type="submit">Erase</button>
			</div>
		</form>
	</section>
</div>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--sp-4);
	}

	.alert {
		border-radius: var(--r-card);
		padding: var(--sp-3) var(--sp-4);
		font-size: var(--fs-small);
		margin: 0;
	}

	.alert--err {
		background: var(--err-soft);
		border: 1px solid var(--err);
		color: var(--err);
	}

	.alert--ok {
		background: var(--ok-soft);
		border: 1px solid var(--ok);
		color: var(--ok);
	}

	.code {
		display: flex;
		gap: var(--sp-2);
	}

	.code__field {
		flex: 1;
		min-width: 0;
		background: var(--bg-2);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		color: var(--text-1);
		padding: 8px 12px;
		font-size: var(--fs-small);
	}

	.note {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-2);
		margin: var(--sp-3) 0 0;
		max-width: 60ch;
	}

	.adopt {
		margin-top: var(--sp-5);
		padding-top: var(--sp-5);
		border-top: 1px solid var(--border);
	}

	.adopt label {
		display: block;
	}

	.stats {
		margin: 0;
		display: grid;
		gap: var(--sp-3);
	}

	.stats div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--sp-4);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--sp-2);
	}

	dt {
		font-size: var(--fs-small);
		color: var(--text-2);
	}

	dd {
		margin: 0;
		font-size: var(--fs-h3);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.actions {
		display: flex;
		gap: var(--sp-3);
		flex-wrap: wrap;
	}

	.danger {
		margin-top: var(--sp-5);
		padding-top: var(--sp-5);
		border-top: 1px solid var(--border);
	}
</style>
