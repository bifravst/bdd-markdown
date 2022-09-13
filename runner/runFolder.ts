import { parseFeaturesInFolder } from './parseFeaturesInFolder'
import { Runner, runSuite } from './runSuite'

export const runFolder = async <Context extends Record<string, any>>(
	folderWithFeatures: string,
): Promise<Runner<Context>> =>
	runSuite<Context>(await parseFeaturesInFolder(folderWithFeatures))
