import { readFile } from 'node:fs/promises'
import { parse } from 'node:path'
import { feature } from 'parser/feature'
import { Feature } from 'parser/grammar'
import { tokenStream } from 'parser/tokenStream'
import { findFilesInFolder } from './findTestFiles'

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

	const featuresFromFiles = await Promise.all(
		featureFiles.map(async (sourceFile) => {
			const source = tokenStream(await readFile(sourceFile, 'utf-8'))
			try {
				const parsedFeature = feature(source)
				return {
					file: parse(sourceFile),
					feature: parsedFeature,
				}
			} catch (error) {
				throw new Error(
					`Failed to parse feature file ${sourceFile}: ${
						(error as Error).message
					}`,
				)
			}
		}),
	)
	return featuresFromFiles
}
