import toposort from 'toposort'
import { FeatureFile } from '../runner/parseFeaturesInFolder.js'

export const orderFeatures = (featureFiles: FeatureFile[]): FeatureFile[] => {
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

	return sorted.map((fileName) => featureFileNameToFeatureFile[fileName])
}
