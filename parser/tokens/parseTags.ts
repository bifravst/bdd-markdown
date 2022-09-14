import { Tags } from '../grammar.js'

const singleTag =
	/^@(?<name>[^\s@:,.]+)(:(?<props>([^\s@=]+(=[^\s@,])?,?)+(?<!,)))?$/
const allTags =
	/((?<!\S)@(?<name>[^\s@:,.]+)(:(?<props>([^\s@=]+(=[^\s@,])?,?)+(?<!a)))?)/g

export const parseTags = (text: string): Tags | undefined => {
	const tags: Tags = {}
	for (const match of text.matchAll(allTags)) {
		const tag = match[1]
		const { name, props } = parseTag(tag) ?? {}
		if (name !== undefined) {
			if (props === undefined) {
				tags[name] = true
			} else {
				tags[name] = props
			}
		}
	}
	return Object.keys(tags).length === 0 ? undefined : tags
}
export const parseTag = (
	text: string,
): { name: string; props?: Record<string, string | true> } | undefined => {
	const res = singleTag.exec(text)
	if (res === null) return undefined
	const { name, props } = res.groups ?? {}

	if (props === undefined) return { name }

	return { name, props: parseProps(props) }
}

const parseProps = (props: string): Record<string, string | true> =>
	props.split(',').reduce((props, prop) => {
		const [name, value] = parseProp(prop)
		return { ...props, [name]: value }
	}, {} as Record<string, string | true>)

const parseProp = (prop: string): [name: string, value: string | true] => {
	const [name, value] = prop.split('=')
	return [name, value === undefined ? true : value]
}
