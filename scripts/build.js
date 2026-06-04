import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })
cpSync('index.html', join('dist', 'index.html'))
cpSync('src', join('dist', 'src'), { recursive: true })
cpSync('public', 'dist', { recursive: true })
console.log('Static site copied to dist/')
