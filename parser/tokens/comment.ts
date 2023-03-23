import { InvalidSyntaxError } from '../errors/InvalidSyntaxError.js'
import { type Comment } from '../grammar.js'
import { type TokenStream } from '../tokenStream.js'
import { parseTags } from './parseTags.js'

const commentStart = (s: TokenStream): boolean => {
	if (s.char() !== '<') return false
	if (s.peekNext() !== '!') return false
	s.next()
	if (s.peekNext() !== '-') return false
	s.next()
	if (s.peekNext() !== '-') return false
	s.next()
	s.next()
	return true
}

const endComment = '-->'

export const comment = (s: TokenStream): Comment | null => {
	if (!commentStart(s)) return null
	const commentTokens: string[] = []
	const end = () => commentTokens.slice(-endComment.length).join('')
	while (true) {
		const char = s.char()
		if (s.isEoF()) break
		commentTokens.push(char)
		s.next()
		if (end() === endComment) break
	}

	if (end() !== endComment)
		throw new InvalidSyntaxError(s, `Comment not closed with ${endComment}`)
	const commentText = commentTokens
		.join('')
		.slice(0, commentTokens.length - endComment.length)
		.trim()
	if (commentText.length === 0) return null

	const c: Comment = { text: commentText }

	const tags = parseTags(commentText)

	if (tags !== undefined) c.tags = tags

	return c
}
