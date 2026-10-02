import assert from 'node:assert/strict';
import { answerRandomChoiceQuestions } from '../packages/scripts/src/utils/random-choice';

require('browser-env')();

function question(type: number, checked = false): HTMLElement {
	const root = document.createElement('div');
	root.className = 'TiMu';
	root.innerHTML = `
		<input id="answertype_${document.querySelectorAll('.TiMu').length}" value="${type}">
		<ul>${['A', 'B', 'C', 'D']
			.map(
				(letter, index) => `<li><label><input type="${type === 1 ? 'checkbox' : 'radio'}" name="q${
					root.id
				}" ${checked && index === 0 ? 'checked' : ''}><span class="after">${letter}</span></label></li>`
			)
			.join('')}</ul>`;
	document.body.append(root);
	return root;
}

async function run(): Promise<void> {
	question(0);
	question(1);
	question(3, true);
	question(2);
	const clicks: HTMLElement[] = [];
	document.querySelectorAll<HTMLElement>('.TiMu .after, .TiMu label').forEach((option) => {
		option.click = () => {
			clicks.push(option);
			option.closest('li')?.querySelector('input')?.setAttribute('checked', 'checked');
		};
	});

	const result = await answerRandomChoiceQuestions(document, () => 0, async () => {});
	assert.deepEqual(result, { total: 4, answered: 2, alreadyAnswered: 1, unsupported: 1 });
	assert.equal(clicks.length, 2);
	assert.equal(clicks[0].closest('.TiMu'), document.querySelectorAll('.TiMu')[0]);
	assert.equal(clicks[1].closest('.TiMu'), document.querySelectorAll('.TiMu')[1]);
	console.log('随机答题测试通过');
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
