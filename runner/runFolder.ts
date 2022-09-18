import { parseFeaturesInFolder } from './parseFeaturesInFolder.js'
import { Runner, runSuite } from './runSuite.js'

export const runFolder = async <Context extends Record<string, any>>({
	folder,
	name,
}: {
	/**
	 * The name for the test suite
	 */
	name: string
	/**
	 * A path to a folder to load the features from
	 */
	folder: string
}): Promise<Runner<Context>> =>
	runSuite<Context>(await parseFeaturesInFolder(folder), name)
