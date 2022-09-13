import { parseFeaturesInFolder } from './parseFeaturesInFolder'
import { runSuite } from './runSuite'

export const runFolder = async <Context extends Record<string, any>>(
	folderWithFeatures: string,
	context?: Context,
): Promise<ReturnType<typeof runSuite>> =>
	runSuite(await parseFeaturesInFolder(folderWithFeatures), context)
