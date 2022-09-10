import os from 'node:os'
import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { TokenStream } from '../tokenStream'

const commenttart = (s: TokenStream): boolean => {
	if (s.char() !== '<') return false
	if (s.next() !== '!') return false
	if (s.next() !== '-') return false
	if (s.next() !== '-') return false
	s.next()
	return true
}

const endComment = '-->'

export const comment = (s: TokenStream): string | null => {
	if (!commenttart(s)) return null
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
	const comment = commentTokens
		.join('')
		.slice(0, commentTokens.length - endComment.length)
		.trim()
	return comment.length === 0 ? null : comment
}
