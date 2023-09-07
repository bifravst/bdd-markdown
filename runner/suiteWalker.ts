import type path from 'node:path'
import {
	Keyword,
	type Feature,
	type Step,
	type Row,
	type Scenario,
} from '../parser/grammar.js'
import { orderFeatures } from './orderFeatures.js'
import type { FeatureFile } from './parseFeaturesInFolder.js'
import { replaceFromExamples } from './replaceFromExamples.js'
import { replaceFromContext } from './replaceFromContext.js'
import { getUnreplacedPlaceholders } from './getUnreplacedPlaceholders.js'

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
export type StepListener = (args: StepListenerArgs) => void
export type SuiteWalker = {
	onStep: (fn: StepListener) => SuiteWalker
	onFeature: (fn: FeatureListener) => SuiteWalker
	onScenario: (fn: ScenarioListener) => SuiteWalker
	walk: () => Promise<void>
}
export type FeatureVariant = Feature & {
	variant: Record<string, string>
}
export type ScenarioWithExamples = Scenario & {
	example?: Row
}

/**
 * Walks a suite of feature files and calls the respective callbacks when a feature, scenario, or step is discovered
 **/
export const suiteWalker = (suite: FeatureFile[]): SuiteWalker => {
	const stepListeners: StepListener[] = []
	const featureListeners: FeatureListener[] = []
	const scenarioListeners: ScenarioListener[] = []
	const walker: SuiteWalker = {
		onFeature: (fn: FeatureListener) => {
			featureListeners.push(fn)
			return walker
		},
		onScenario: (fn: ScenarioListener) => {
			scenarioListeners.push(fn)
			return walker
		},
		onStep: (fn: StepListener) => {
			stepListeners.push(fn)
			return walker
		},
		walk: async (context: Record<string, any> = {}) => {
			for (const { file, feature, skip } of orderFeatures(suite)) {
				if (skip) {
					featureListeners.map((listener) =>
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
								const { examples: _, ...scenarioRest } = scenario
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
									...context,
									variant,
								})
								const unreplaced = getUnreplacedPlaceholders(replacedStep)
								if (unreplaced.length > 0) {
									throw new Error(
										`Step has unreplaced placeholders: ${step.title}`,
									)
								}
								stepListeners.map((fn) =>
									fn({
										file,
										feature: featureVariant,
										scenario,
										step: replacedStep,
									}),
								)
							}
						}
					}
				}
			}
		},
	}
	return walker
}
