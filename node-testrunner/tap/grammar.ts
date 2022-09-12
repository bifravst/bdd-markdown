export enum TAPType {
	comment = 'comment',
	assert = 'assert',
	plan = 'plan',
	complete = 'complete',
	version = 'version',
	child = 'child',
}

export type TAPPlan = {
	start: number
	end: number
	skipAll: boolean
	skipReason: string
	comment: string
}
export type TAPFailure = {
	ok: boolean
	id: number
	name: string
	diag: {
		duration_ms: number
		failureType?: string
		error?: string
		code?: string
		stack?: string
	}
	fullname: string
}

export type TAPComplete = {
	ok: boolean
	count: number
	pass: number
	fail: number
	bailout: boolean
	todo: number
	skip: number
	plan: TAPPlan
	failures: TAPFailure
	time: number
}

export type TAPChild =
	| [TAPType.assert, TAPFailure]
	| [TAPType.comment, string]
	| [TAPType.complete, TAPComplete]

export type TAP = (
	| [TAPType.version, number]
	| [TAPType.plan, TAPPlan]
	| [TAPType.assert, TAPFailure]
	| [TAPType.comment, string]
	| [TAPType.complete, TAPComplete]
	| [TAPType.child, TAPChild[]]
)[]
