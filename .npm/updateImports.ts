export const updateImports = (source: string): string =>
	source.replace(/from ['"](.+?)\.ts['"]/g, "from '$1.js'")
