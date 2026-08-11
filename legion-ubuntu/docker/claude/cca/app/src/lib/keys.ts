/** Shared keyboard-shortcut guard for the quiz runner and the flashcard deck. */
export function isTypingTarget(event: KeyboardEvent): boolean {
	if (event.metaKey || event.ctrlKey || event.altKey) return true;

	const target = event.target as HTMLElement | null;
	if (target === null) return false;

	return (
		target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
	);
}
