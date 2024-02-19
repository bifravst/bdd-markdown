import config from '@bifravst/eslint-config-typescript'
export default [
	...config,
	{
		files: ['parser/**/*.ts'],
		rules: {
			'no-constant-condition': ['warn'],
		},
	},
	{
		files: ['**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-floating-promises': ['warn'],
		},
	},
]
