import { type LogObserver } from './logger.js'
import { parseFeaturesInFolder } from './parseFeaturesInFolder.js'
import { runSuite, type Runner } from './runSuite.js'

export const runFolder = async <Context extends Record<string, any>>({
	folder,
	name,
	logObserver,
}: {
	/**
	 * The name for the test suite
	 */
	name: string
	/**
	 * A path to a folder to load the features from
	 */
	folder: string
	/**
	 * Observe logs while they are being emitted
	 */
	logObserver?: LogObserver
}): Promise<Runner<Context>> =>
	runSuite<Context>(await parseFeaturesInFolder(folder), name, logObserver)
