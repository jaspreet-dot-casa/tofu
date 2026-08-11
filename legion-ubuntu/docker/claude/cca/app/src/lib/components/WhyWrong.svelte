<script lang="ts">
	/**
	 * One line per option explaining why it lands where it does. Shared by the drill
	 * runner (which shows only the distractors, since the correct one is already
	 * marked) and the results review (which shows all four).
	 */
	import { OPTION_LETTERS } from '$lib/data/option-index';

	interface Props {
		/** Reasons in display order. */
		why: readonly string[];
		/** Display index of the correct option; omit to show every option. */
		skip?: number | null;
	}

	let { why, skip = null }: Props = $props();
</script>

<ul class="whywrong">
	{#each why as reason, i (i)}
		{#if i !== skip}
			<li>
				<span class="whywrong__key">{OPTION_LETTERS[i]}</span><span>{reason}</span>
			</li>
		{/if}
	{/each}
</ul>
