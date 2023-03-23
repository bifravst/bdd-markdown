import os from 'os'
import type { ParsedPath } from 'path'
import prettier from 'prettier'
import type { CodeBlock, Step } from '../parser/grammar.js'
import type { FeatureResult, ScenarioExecution } from '../runner/runFeature.js'
import type { ScenarioResult } from '../runner/runScenario.js'
import type { StepResult } from '../runner/runStep.js'
import type { SuiteResult } from '../runner/runSuite.js'
import { escapeLogMessage } from './markdown/escapeLogMessage.js'
import { inputTable } from './markdown/inputTable.js'
import { logEntry } from './markdown/logEntry.js'

export const markdownReporter = (result: SuiteResult): string =>
	prettier.format(
		[
			...titleMd(result),
			'',
			...summaryMd(result),
			'',
			...result.results
				.map((feature, i, features) => {
					const r = [...featureMd(feature)]
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

const featureMd = ([path, result]: [ParsedPath, FeatureResult]): string[] => {
	const featureMd = []

	featureMd.push(
		`## ${result.ok ? ':heavy_check_mark:' : ':x:'} ${path.name}`,
		'',
	)

	if (result.logs.length !== 0) {
		featureMd.push(
			...details(
				'Feature log',
				result.logs.map((s, i, logs) => logEntry(s, i === logs.length - 1)),
			),
		)
	}

	featureMd.push(
		...result.results
			.map((scenario, i, scenarios) => {
				const r = [...scenarioMd(scenario)]
				if (i !== scenarios.length - 1) r.push('---')
				return r
			})
			.flat(),
	)

	return featureMd
}

const scenarioMd = ([execution, result]: [
	ScenarioExecution,
	ScenarioResult,
]): string[] => {
	const scenarioMd = [
		`### ${result.ok ? ':heavy_check_mark:' : ':x:'} ${
			execution.title ?? execution.keyword
		}`,
		'',
	]

	if (execution.example !== undefined) {
		scenarioMd.push(...details('Input', inputTable(execution.example)))
	}

	if (result.logs.length !== 0) {
		scenarioMd.push(
			...details(
				'Scenario log',
				result.logs.map((s, i, logs) => logEntry(s, i === logs.length - 1)),
			),
		)
	}

	scenarioMd.push(...result.results.map(stepMd).flat(), '')

	return scenarioMd
}

const stepMd = ([, result]: [Step, StepResult]): string[] => {
	const stepMd = [
		`${result.ok ? ':heavy_check_mark:' : ':x:'} **${
			result.executed.keyword
		}** ${result.executed.title}`,
	]
	stepMd.push('')

	if (result.logs.length !== 0) {
		stepMd.push(
			...details(
				'Step log',
				result.logs.map((s, i, logs) => logEntry(s, i === logs.length - 1)),
			),
		)
	}

	if (result.executed.codeBlock !== undefined) {
		stepMd.push(...codeBlockMd(result.executed.codeBlock))
		stepMd.push('')
	}

	if (result.result !== undefined) {
		stepMd.push(
			`> _Result:_ ${escapeLogMessage(
				result.printable ?? JSON.stringify(result),
			)}`,
		)
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
