import {
	feature,
	Feature,
	tokenStream,
} from '@nordicsemiconductor/bdd-markdown'
import { readFile } from 'node:fs/promises'
import { parse } from 'node:path'
import { findFilesInFolder } from './findTestFiles.js'

export type FeatureFile = {
	file: ReturnType<typeof parse>
	feature: Feature
}
export const parseFeaturesInFolder = async (
	folderWithFeatures: string,
): Promise<FeatureFile[]> => {
	const featureFiles = await findFilesInFolder(
		folderWithFeatures,
		'.feature.md',
	)

	const featuresFromFiles = await Promise.all(featureFiles.map(loadFeatureFile))
	return featuresFromFiles
}

export const loadFeatureFile = async (
	sourceFile: string,
): Promise<FeatureFile> => {
	const source = tokenStream(await readFile(sourceFile, 'utf-8'))
	try {
		const parsedFeature = feature(source)
		return {
			file: parse(sourceFile),
			feature: parsedFeature,
		}
	} catch (error) {
		throw new Error(
			`Failed to parse feature file ${sourceFile}: ${(error as Error).message}`,
		)
	}
}
