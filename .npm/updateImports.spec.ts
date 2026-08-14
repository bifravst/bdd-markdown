import assert from 'node:assert'
import { describe, it } from 'node:test'
import { updateImports } from './updateImports.ts'

void describe('updateImports', () => {
	void it('replaces .ts with .js in relative imports', () => {
		const input = `import { foo } from './bar.ts';`
		const expected = `import { foo } from './bar.js';`
		assert.equal(updateImports(input), expected)
	})
})
