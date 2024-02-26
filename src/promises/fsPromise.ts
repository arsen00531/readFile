import { writeFile, unlink } from 'fs'
import { promisify } from 'util'

const writeFileAsync = promisify(writeFile)
const unlinkAsync = promisify(unlink)

export { writeFileAsync, unlinkAsync }