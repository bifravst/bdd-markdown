/*
 * Compile source for NPM
 */

import swc from '@swc/core'
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tsconfig from './tsconfig.npm.json' with { type: 'json' }
import { updateImports } from './updateImports.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const outDir = path.join(__dirname, '..', 'dist')
const rootDir = path.join(__dirname, '..')

rmSync(outDir, { recursive: true, force: true })

const sourceFiles = new Set<string>()

for (const include of tsconfig.include) {
	const includePath = path.resolve(__dirname, include)

	if (existsSync(includePath) && statSync(includePath).isFile()) {
		if (includePath.endsWith('.ts')) sourceFiles.add(includePath)
		continue
	}

	for await (const file of glob(`${includePath}/**/*.ts`)) {
		sourceFiles.add(path.resolve(file))
	}
}

for (const file of [...sourceFiles].sort()) {
	if (file.endsWith('.spec.ts')) continue
	let compiled = (
		await swc.transformFile(file, {
			jsc: {
				parser: {
					syntax: 'typescript',
				},
				target: 'es2024',
			},
			module: {
				type: 'es6',
			},
		})
	).code

	compiled = updateImports(compiled)

	const targetFile = path.join(
		outDir,
		path.relative(rootDir, file).replace(/\.ts$/, '.js'),
	)

	mkdirSync(dirname(targetFile), { recursive: true })

	writeFileSync(targetFile, compiled, 'utf8')

	console.log(file)
}
