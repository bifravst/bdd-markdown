import { readdir, stat } from 'fs/promises'
import path from 'path'

export const findFilesInFolder = async (
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
