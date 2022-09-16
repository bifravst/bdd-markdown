import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { markDependentsSkipped } from './markDependentsSkipped.js'

describe('markDependentsSkipped()', () => {
	it('should mark features as skipped, if they transiently depend on a skipped feature', () => {
		const expected: ReturnType<typeof markDependentsSkipped> = {
			'A.feature': {
				skipped: true,
				needs: [],
			},
			'B.feature': {
				skipped: true,
				needs: ['A.feature'],
			},
			'C.feature': {
				skipped: true,
				needs: ['B.feature'],
			},
		}
		assert.deepEqual(
			markDependentsSkipped({
				'A.feature': {
					skipped: true,
					needs: [],
				},
				'B.feature': {
					skipped: false,
					needs: ['A.feature'],
				},
				'C.feature': {
					skipped: false,
					needs: ['B.feature'],
				},
			}),
			expected,
		)
	})
	it('should mark features as skipped, if the depend on a skipped feature', () => {
		const expected: ReturnType<typeof markDependentsSkipped> = {
			'A.feature': {
				skipped: true,
				needs: [],
			},
			'B.feature': {
				skipped: true,
				needs: ['A.feature'],
			},
		}
		assert.deepEqual(
			markDependentsSkipped({
				'A.feature': {
					skipped: true,
					needs: [],
				},
				'B.feature': {
					skipped: false,
					needs: ['A.feature'],
				},
			}),
			expected,
		)
	})

	it('should not mark a feature any feature as skipped if none are skipped', () => {
		const expected: ReturnType<typeof markDependentsSkipped> = {
			'A.feature': {
				skipped: false,
				needs: [],
			},
			'B.feature': {
				skipped: false,
				needs: [],
			},
		}
		assert.deepEqual(
			markDependentsSkipped({
				'A.feature': {
					skipped: false,
					needs: [],
				},
				'B.feature': {
					skipped: false,
					needs: [],
				},
			}),
			expected,
		)
	})

	it('should not mark other features as skipped, if they do not depend on the skipped feature', () => {
		const expected: ReturnType<typeof markDependentsSkipped> = {
			'A.feature': {
				skipped: true,
				needs: [],
			},
			'B.feature': {
				skipped: false,
				needs: [],
			},
		}
		assert.deepEqual(
			markDependentsSkipped({
				'A.feature': {
					skipped: true,
					needs: [],
				},
				'B.feature': {
					skipped: false,
					needs: [],
				},
			}),
			expected,
		)
	})
})
