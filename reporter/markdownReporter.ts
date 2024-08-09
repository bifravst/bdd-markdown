import os from 'os'
import type { ParsedPath } from 'path'
import prettier from 'prettier'
import type { CodeBlock, Step } from '../parser/grammar.js'
import type {
	FeatureResult,
	ScenarioResult,
	StepResult,
	SuiteResult,
} from '../runner/runSuite.js'
import type { ScenarioWithExamples } from '../runner/suiteWalker.js'
import { inputTable } from './markdown/inputTable.js'
import { logEntry } from './markdown/logEntry.js'

export const markdownReporter = async (result: SuiteResult): Promise<string> =>
	prettier.format(
		[
			...titleMd(result),
			'',
			...summaryMd(result),
			'',
			...result.results
				.map((feature, i, features) => {
					const r = [...featureMd(feature, result.startTime)]
					if (i !== features.length - 1) r.push('---')
					return r
				})
				.flat(),
		].join(os.EOL),
		{
			parser: 'markdown',
		},
	)

const titleMd = (result: SuiteResult): string[] => [
	`# ${result.ok ? ':heavy_check_mark:' : ':x:'} ${result.name}`,
]

const summaryMd = (result: SuiteResult) => {
	const numPass = result.results.filter(([, { ok }]) => ok === true).length
	const numFail = result.results.filter(([, { ok }]) => ok !== true).length
	const duration = result.results.reduce(
		(total, [, result]) => total + result.duration,
		0,
	)
	return [
		`> Failed: ${numFail}  `,
		`> Passed: ${numPass}  `,
		`> Total: ${result.results.length}  `,
		`> Duration: ⏲ ${duration} ms`,
	]
}

const featureMd = (
	[path, result]: [ParsedPath, FeatureResult],
	startTime: number,
): string[] => {
	const featureMd = []

	featureMd.push(
		`## ${result.ok ? ':heavy_check_mark:' : ':x:'} ${path.name}`,
		'',
	)

	featureMd.push(
		...result.results
			.map((scenario, i, scenarios) => {
				const r = [...scenarioMd(scenario, startTime)]
				if (i !== scenarios.length - 1) r.push('---')
				return r
			})
			.flat(),
	)

	return featureMd
}

const scenarioMd = (
	[execution, result]: [ScenarioWithExamples, ScenarioResult],
	startTime: number,
): string[] => {
	const scenarioMd = [
		`### ${result.ok ? ':heavy_check_mark:' : ':x:'} ${
			execution.title ?? execution.keyword
		}`,
		'',
	]

	if (execution.example !== undefined) {
		scenarioMd.push(...details('Input', inputTable(execution.example)))
	}

	scenarioMd.push(
		...result.results.map((result) => stepMd(result, startTime)).flat(),
		'',
	)

	return scenarioMd
}

const stepMd = (
	[step, result]: [Step, StepResult],
	startTime: number,
): string[] => {
	const stepMd = [
		`${result.ok ? ':heavy_check_mark:' : ':x:'} **${step.keyword}** ${
			step.title
		}`,
	]
	stepMd.push('')

	if (result.logs.length !== 0) {
		stepMd.push(
			...details(
				'Step log',
				result.logs.map((s, i, logs) =>
					logEntry(s, i === logs.length - 1, startTime),
				),
			),
		)
	}

	if (step.codeBlock !== undefined) {
		stepMd.push(...codeBlockMd(step.codeBlock))
		stepMd.push('')
	}

	return stepMd
}

const codeBlockMd = (codeBlock: CodeBlock): string[] => [
	'```' + (codeBlock.language ?? ''),
	...codeBlock.code.split(os.EOL),
	'```',
]

const details = (title: string, content: string[]): string[] => [
	'<details>',
	`  <summary>${title}</summary>`,
	'  ',
	...content,
	'',
	'</details>',
	'',
]
