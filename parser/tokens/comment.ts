import os from 'node:os'
import { InvalidSyntaxError } from '../errors/InvalidSyntaxError.js'
import { Comment } from '../grammar.js'
import { TokenStream } from '../tokenStream.js'
import { parseTags } from './parseTags.js'

const commentStart = (s: TokenStream): boolean => {
	if (s.char() !== '<') return false
	if (s.next() !== '!') return false
	if (s.next() !== '-') return false
	if (s.next() !== '-') return false
	s.next()
	return true
}

const endComment = '-->'

export const comment = (s: TokenStream): Comment | null => {
	if (!commentStart(s)) return null
	const commentTokens = []
	while (true) {
		const char = s.char()
		if (char === os.EOL) break
		if (s.isEoF()) break
		commentTokens.push(char)
		s.next()
	}

	if (
		commentTokens.join('').slice(commentTokens.length - endComment.length) !==
		endComment
	)
		throw new InvalidSyntaxError(s, `Comment not closed with ${endComment}`)
	const commentText = commentTokens
		.join('')
		.slice(0, commentTokens.length - endComment.length)
		.trim()
	if (commentText.length === 0) return null

	const c: Comment = { comment: commentText }

	const tags = parseTags(commentText)

	if (tags !== undefined) c.tags = tags

	return c
}
