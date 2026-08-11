import type { DomainId } from '../domains';
import type { ScenarioId } from '../scenarios';
import { asOriginal, OPTION_COUNT, type OriginalIndex } from '../option-index';

export interface Option {
	text: string;
	/**
	 * Why this option is right or wrong. Shown in review — the distractors are where
	 * the learning is, because the exam builds them out of plausible field mistakes
	 * rather than obvious nonsense.
	 */
	why: string;
}

/** Exactly four: one correct answer and three distractors, as the exam sets them. */
export type Options = readonly [Option, Option, Option, Option];

export interface Question {
	id: string;
	/** Which domain this counts toward for readiness scoring. */
	domain: DomainId;
	/** Scenario this question belongs to; mock exams draw whole scenarios. */
	scenario: ScenarioId;
	stem: string;
	options: Options;
	/** Index into the AUTHORED options — never a display index. */
	answer: OriginalIndex;
	/** The one-paragraph takeaway, shown after answering. */
	explanation: string;
	/** Lesson slug to revise if this was missed. */
	lesson?: string;
}

/** The authored shape: `answer` is a plain number until `defineQuestions` brands it. */
type QuestionInput = Omit<Question, 'scenario' | 'answer'> & { answer: number };

/**
 * Validates and brands a scenario's questions. Ids must be unique and the answer
 * must be a real option index — both are the kind of mistake that is invisible in
 * a 16-question module and obvious the moment it is checked.
 */
export function defineQuestions(
	scenario: ScenarioId,
	questions: readonly QuestionInput[]
): Question[] {
	const seen = new Set<string>();

	return questions.map((q) => {
		if (seen.has(q.id)) throw new Error(`duplicate question id "${q.id}" in scenario ${scenario}`);
		seen.add(q.id);

		if (q.options.length !== OPTION_COUNT) {
			throw new Error(`question ${q.id}: expected ${OPTION_COUNT} options`);
		}

		return { ...q, scenario, answer: asOriginal(q.answer) };
	});
}
