export type RandomChoiceResult = {
	total: number;
	answered: number;
	alreadyAnswered: number;
	unsupported: number;
};

function hasChosenOption(question: HTMLElement): boolean {
	return Boolean(
		question.querySelector(
			'input[type="radio"]:checked, input[type="checkbox"]:checked, input[checked], li[aria-checked="true"], .check_answer'
		)
	);
}

/** Randomly answer supported Chaoxing chapter choice questions without a question bank. */
export async function answerRandomChoiceQuestions(
	doc: Document,
	random: () => number = Math.random,
	pause: (milliseconds: number) => Promise<void> = (milliseconds) =>
		new Promise((resolve) => setTimeout(resolve, milliseconds))
): Promise<RandomChoiceResult> {
	const result: RandomChoiceResult = { total: 0, answered: 0, alreadyAnswered: 0, unsupported: 0 };

	for (const question of Array.from(doc.querySelectorAll<HTMLElement>('.TiMu'))) {
		result.total++;
		const type = Number(question.querySelector<HTMLInputElement>('input[id^="answertype"]')?.value);
		if (![0, 1, 3].includes(type)) {
			result.unsupported++;
			continue;
		}

		const options = Array.from(
			new Set(
				Array.from(question.querySelectorAll<HTMLElement>('ul li .after, ul li label:not(.before)'))
					.map((element) => element.closest<HTMLElement>('li'))
					.filter((element): element is HTMLElement => Boolean(element))
			)
		);
		if (options.length < 2) {
			result.unsupported++;
			continue;
		}

		// Leave answers already selected by the student untouched.
		if (hasChosenOption(question)) {
			result.alreadyAnswered++;
			continue;
		}

		const shuffled = [...options];
		for (let index = shuffled.length - 1; index > 0; index--) {
			const other = Math.floor(random() * (index + 1));
			[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
		}

		// A multiple-choice question gets a random nonempty subset of its options.
		const count = type === 1 ? 1 + Math.floor(random() * shuffled.length) : 1;
		for (const option of shuffled.slice(0, count)) {
			(
				option.querySelector<HTMLElement>('.after') ||
				option.querySelector<HTMLElement>('label:not(.before)') ||
				option
			).click();
			await pause(200);
		}
		if (hasChosenOption(question)) result.answered++;
		else result.unsupported++;
	}

	return result;
}
