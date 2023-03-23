type FeatureFileName = string
type SkippedMap = Record<
	FeatureFileName,
	{ skipped: boolean; needs: FeatureFileName[] }
>
export const markDependentsSkipped = (featureMap: SkippedMap): SkippedMap => {
	for (let i = 0; i < Object.keys(featureMap).length; i++) {
		const l = Object.entries(featureMap)
		const [fileName, { skipped }] = l[i] as [
			string,
			{
				skipped: boolean
				needs: FeatureFileName[]
			},
		]
		if (skipped) {
			// Find features that depend on this one,
			const featuresToBeMarkedAsSkipped = l
				.filter(([, { needs }]) => needs.includes(fileName))
				// and are not yet skipped
				.filter(([, { skipped }]) => !skipped)
			featuresToBeMarkedAsSkipped.forEach(([fileName]) => {
				// Mark them as skipped
				;(
					featureMap[fileName] as { skipped: boolean; needs: FeatureFileName[] }
				).skipped = true
			})
			if (featuresToBeMarkedAsSkipped.length > 0) {
				// The list of skipped features was changed,
				// restart from the beginning to cover transient dependencies.
				i = 0
			}
		}
	}
	return featureMap
}
