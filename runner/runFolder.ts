import { parseFeaturesInFolder } from './parseFeaturesInFolder.js'
import { Runner, runSuite } from './runSuite.js'

export const runFolder = async <Context extends Record<string, any>>(
	folderWithFeatures: string,
): Promise<Runner<Context>> =>
	runSuite<Context>(await parseFeaturesInFolder(folderWithFeatures))
