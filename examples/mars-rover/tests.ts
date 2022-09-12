import path from 'path'
import { print, runner } from 'runner'

const res = await runner(
	path.join(process.cwd(), 'examples', 'mars-rover'),
).run()

print(res)

if (!res.ok) process.exit(1)
