import type path from 'node:path'
import {
	Keyword,
	type Feature,
	type Row,
	type Scenario,
	type Step,
} from '../parser/grammar.js'
import {
	Source,
	getUnreplacedPlaceholders,
} from './getUnreplacedPlaceholders.js'
import { orderFeatures } from './orderFeatures.js'
import type { FeatureFile } from './parseFeaturesInFolder.js'
import { replaceFromContext } from './replaceFromContext.js'
import { replaceFromExamples } from './replaceFromExamples.js'
import { UnreplacedPlaceholdersError } from './UnreplacedPlaceholdersError.js'

type FeatureListenerArgs = {
	feature: FeatureVariant
	file: path.ParsedPath
}
export type FeatureListener = (
	args: FeatureListenerArgs & {
		skip: boolean
	},
) => void
type ScenarioListenerArgs = FeatureListenerArgs & {
	scenario: ScenarioWithExamples
}
export type ScenarioListener = (args: ScenarioListenerArgs) => void
type StepListenerArgs = ScenarioListenerArgs & {
	step: Step
}
export type StepListener = (args: StepListenerArgs) => void | Promise<void>
export type SuiteWalker = {
	onStep: (fn: StepListener) => SuiteWalker
	onFeature: (fn: FeatureListener) => SuiteWalker
	onFeatureEnd: (fn: FeatureListener) => SuiteWalker
	onScenario: (fn: ScenarioListener) => SuiteWalker
	onScenarioEnd: (fn: ScenarioListener) => SuiteWalker
	walk: () => Promise<void>
}
export type FeatureVariant = Feature & {
	variant: Record<string, string>
}
export type ScenarioWithExamples = Scenario & {
	example?: Row
}
export type UnreplacedPlaceholdersListener = (
	error: UnreplacedPlaceholdersError,
) => void

/**
 * Walks a suite of feature files and calls the respective callbacks when a feature, scenario, or step is discovered
 **/
export const suiteWalker = (
	suite: FeatureFile[],
	context?: Record<string, any>,
): SuiteWalker => {
	const stepListeners: StepListener[] = []
	const featureListeners: FeatureListener[] = []
	const scenarioListeners: ScenarioListener[] = []
	const featureEndListeners: FeatureListener[] = []
	const scenarioEndListeners: ScenarioListener[] = []
	const walker: SuiteWalker = {
		onFeature: (fn: FeatureListener) => {
			featureListeners.push(fn)
			return walker
		},
		onScenario: (fn: ScenarioListener) => {
			scenarioListeners.push(fn)
			return walker
		},
		onFeatureEnd: (fn: FeatureListener) => {
			featureEndListeners.push(fn)
			return walker
		},
		onScenarioEnd: (fn: ScenarioListener) => {
			scenarioEndListeners.push(fn)
			return walker
		},
		onStep: (fn: StepListener) => {
			stepListeners.push(fn)
			return walker
		},
		walk: async () => {
			for (const { file, feature, skip } of orderFeatures(suite)) {
				if (skip ?? false) {
					;[...featureListeners, ...featureEndListeners].map((listener) =>
						listener({
							file,
							feature: { ...feature, variant: {} },
							skip: true,
						}),
					)
					continue
				}
				for (const variant of feature.frontMatter?.variants ?? [{}]) {
					const featureVariant: FeatureVariant = { ...feature, variant }
					featureListeners.map((listener) =>
						listener({ file, feature: featureVariant, skip: false }),
					)
					for (const scenario of featureVariant.scenarios) {
						const scenarios: ScenarioWithExamples[] = []
						if (scenario.keyword === Keyword.ScenarioOutline) {
							for (const row of scenario.examples) {
								const { examples, ...scenarioRest } = scenario
								void examples
								const scenarioFromExample: ScenarioWithExamples = {
									...scenarioRest,
									keyword: Keyword.Scenario,
									steps: await Promise.all(
										scenario.steps.map(async (s) =>
											replaceFromExamples(s, row),
										),
									),
									example: row,
								}
								scenarios.push(scenarioFromExample)
							}
						} else {
							scenarios.push(scenario)
						}
						for (const scenario of scenarios) {
							scenarioListeners.map((fn) =>
								fn({
									file,
									feature: featureVariant,
									scenario,
								}),
							)
							for (const step of scenario.steps) {
								const replacedStep = await replaceFromContext(step, {
									...(feature.frontMatter?.exampleContext ?? {}),
									...context,
									variant,
								})
								const unreplaced = getUnreplacedPlaceholders(
									replacedStep,
								).filter(({ source }) => source === Source.title)
								if (unreplaced.length > 0) {
									const err = new UnreplacedPlaceholdersError(
										file,
										step,
										unreplaced,
									)
									throw err
								}
								await Promise.all(
									stepListeners.map(async (fn) =>
										fn({
											file,
											feature: featureVariant,
											scenario,
											step: replacedStep,
										}),
									),
								)
							}
							scenarioEndListeners.map((fn) =>
								fn({
									file,
									feature: featureVariant,
									scenario,
								}),
							)
						}
					}
					featureEndListeners.map((listener) =>
						listener({ file, feature: featureVariant, skip: false }),
					)
				}
			}
		},
	}
	return walker
}
