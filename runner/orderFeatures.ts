import toposort from 'toposort'
import { RunConfigSchema } from '../parser/grammar.js'
import { markDependentsSkipped } from './markDependentsSkipped.js'
import { FeatureFile } from './parseFeaturesInFolder.js'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'

const validator = validateWithJSONSchema(RunConfigSchema)

export const orderFeatures = (featureFiles: FeatureFile[]): FeatureFile[] => {
	// Validate config
	for (const {
		file: { name },
		feature,
	} of featureFiles) {
		const maybeValidRunConfig = validator(feature.frontMatter ?? {})
		if ('errors' in maybeValidRunConfig)
			throw new Error(
				`Invalid run config for feature "${
					feature.title ?? name
				}": ${JSON.stringify(maybeValidRunConfig.errors)}`,
			)
	}

	const featureNameToFile = featureFiles.reduce((map, { file, feature }) => {
		if (feature.title !== undefined) {
			map[feature.title] = file.name
		}
		return map
	}, {} as Record<string, string>)
	const featureFileNameToFeatureFile = featureFiles.reduce(
		(map, { file, feature }) => ({
			...map,
			[file.name]: { file, feature },
		}),
		{} as Record<string, FeatureFile>,
	)

	let sorted = featureFiles.map(({ file: { name } }) => name)

	// Sort `first` features to the beginning
	sorted.sort((fileName) =>
		featureFileNameToFeatureFile[fileName].feature.frontMatter?.run === 'first'
			? -1
			: 1,
	)
	// Sort `last` features to the end
	sorted.sort((fileName) =>
		featureFileNameToFeatureFile[fileName].feature.frontMatter?.run === 'last'
			? 1
			: -1,
	)

	// Build dependency graph
	const edges = sorted.reduce((graph, fileName) => {
		const featureFile = featureFileNameToFeatureFile[fileName]
		for (const dependencyName of featureFile.feature.frontMatter?.needs ?? []) {
			const dependency = featureNameToFile[dependencyName]
			if (dependency === undefined)
				throw new Error(
					`Feature "${
						featureFile.feature.title ?? fileName
					}" depends on unknown feature "${dependencyName}"!`,
				)
			graph.push([dependency, fileName])
		}
		return graph
	}, [] as [string, string | undefined][])

	// Sort by dependencies
	sorted = toposort.array(sorted, edges)

	// Check if features have been marked as runOnly
	const runOnlyThese = featureFiles
		.filter(({ feature }) => feature.frontMatter?.run === 'only')
		.map(({ file }) => file.name)
	const hasRunOnly = runOnlyThese.length > 0

	// Build map of dependencies
	const dependencyMap = edges.reduce(
		(dependencyMap, [dependency, dependent]) => {
			if (dependent === undefined) return dependencyMap
			return {
				...dependencyMap,
				[dependency]: [...(dependencyMap[dependency] ?? []), dependent],
			}
		},
		{} as Record<string, string[]>,
	)

	const skippedFeaturesMap = featureFiles.reduce(
		(skipped, { file: { name }, feature }) => ({
			...skipped,
			[name]: {
				// Mark a feature as skipped ...
				skipped:
					// if it should not run, ...
					(feature.frontMatter?.run === 'never' ||
						// or there are other features marked as `only`
						(hasRunOnly && !runOnlyThese.includes(name))) &&
					// but not if it is needed by an onlyFeature
					dependencyMap[name]?.find(
						(name) => runOnlyThese.find((f) => f === name) !== undefined,
					) === undefined,
				// Make sure the dependency exists
				needs: (feature.frontMatter?.needs ?? []).map((dependencyName) => {
					const dependency = featureFiles.find(
						({ file: { name }, feature }) =>
							(feature.title ?? name) === dependencyName,
					)
					if (dependency === undefined)
						throw new Error(
							`Feature "${
								feature.title ?? name
							}" depends on unknown feature "${dependencyName}"!`,
						)
					return dependency.file.name
				}),
			},
		}),
		{} as Record<string, { skipped: boolean; needs: string[] }>,
	)

	// Transiently mark features as skipped that should not be run
	markDependentsSkipped(skippedFeaturesMap)

	return sorted.map((fileName) => {
		const f = featureFileNameToFeatureFile[fileName]
		if (skippedFeaturesMap[fileName].skipped) f.skip = true
		return f
	})
}
