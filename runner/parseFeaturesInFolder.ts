import { readFile } from 'node:fs/promises'
import { parse } from 'node:path'
import type { Feature } from '../parser/grammar.js'
import { tokenStream } from '../parser/tokenStream.js'
import { feature } from '../parser/feature.js'
import { readdir, stat } from 'fs/promises'
import path from 'path'

export type FeatureFile = {
	file: ReturnType<typeof parse>
	feature: Feature
	skip?: boolean
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

const findFilesInFolder = async (
	baseDir: string,
	extension: string,
): Promise<string[]> => exploreDirectory(baseDir, extension)

const exploreDirectory = async (
	dir: string,
	extension: string,
): Promise<string[]> => {
	const files: string[] = []
	for (const entry of await readdir(dir)) {
		const f = path.join(dir, entry)
		const s = await stat(f)
		if (s.isFile()) {
			if (entry.endsWith(extension)) files.push(f)
		} else {
			if (s.isDirectory()) {
				files.push(...(await exploreDirectory(f, extension)))
			}
		}
	}
	return files.sort((a, b) => a.localeCompare(b))
}
