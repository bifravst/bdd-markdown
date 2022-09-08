import { readdir, stat } from 'fs/promises'
import path from 'path'

export const findTestFiles = async (baseDir: string) =>
	exploreDirectory(baseDir)

const exploreDirectory = async (dir: string) => {
	const files: string[] = []
	for (const entry of await readdir(dir)) {
		const f = path.join(dir, entry)
		const s = await stat(f)
		if (s.isFile()) {
			if (entry.endsWith('.spec.ts')) files.push(f)
		} else {
			if (s.isDirectory()) {
				files.push(...(await exploreDirectory(f)))
			}
		}
	}
	return files.sort((a, b) => a.localeCompare(b))
}
