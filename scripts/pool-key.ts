/**
 * Pool encryption key management.
 *
 * Reads the 256-bit AES-GCM key from `.env.pool` (hex string).
 * If the file does not exist, generates a new random key and writes it.
 */
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const KEY_BYTES = 32 // AES-256
const ENV_FILE = '.env.pool'

/** Resolve `.env.pool` relative to project root. */
function envPath(root: string): string {
  return resolve(root, ENV_FILE)
}

/** Read or generate the pool encryption key (returns 32-byte Buffer). */
export function getPoolKey(projectRoot: string): Buffer {
  const p = envPath(projectRoot)

  if (existsSync(p)) {
    const hex = readFileSync(p, 'utf-8').trim()
    if (!/^[0-9a-f]{64}$/i.test(hex)) {
      throw new Error(`.env.pool must contain a 64-char hex string, got ${hex.length} chars`)
    }
    return Buffer.from(hex, 'hex')
  }

  // First build: generate a random key
  const key = randomBytes(KEY_BYTES)
  writeFileSync(p, key.toString('hex') + '\n', 'utf-8')
  console.log(`[pool-key] Generated new pool encryption key → ${p}`)
  return key
}
