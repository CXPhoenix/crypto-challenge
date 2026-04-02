/**
 * VitePress Vite plugin that strips the `generator` field from challenge
 * Markdown frontmatter during production builds.
 *
 * In dev mode the plugin is a no-op, preserving the current development flow.
 */
import type { Plugin } from 'vite'

/**
 * Match challenge Markdown files only.
 * Paths look like: /path/to/docs/challenge/caesar-basic.md
 */
const CHALLENGE_RE = /\/challenge\/[^/]+\.md$/

/**
 * Match the `generator:` frontmatter field (YAML block scalar or inline).
 * Handles both `generator: |` (block scalar) and `generator: "..."` (inline).
 *
 * For block scalars, we match from `generator: |` (or `generator: >`)
 * until the next top-level key (a line starting with a non-space char followed by `:`)
 * or the frontmatter closing `---`.
 */
const GENERATOR_BLOCK_RE = /^generator:\s*[|>]-?\s*\n(?:[ \t]+.*\n?)*/m
const GENERATOR_INLINE_RE = /^generator:\s*.+\n?/m

export function stripGenerator(): Plugin {
  return {
    name: 'strip-generator',
    enforce: 'pre',
    apply: 'build', // only in production builds

    transform(code, id) {
      if (!CHALLENGE_RE.test(id)) return null
      if (!id.endsWith('.md')) return null

      // Find frontmatter boundaries
      const fmMatch = code.match(/^---\n([\s\S]*?)\n---/)
      if (!fmMatch) return null

      const fmStart = 4 // after "---\n"
      const fmEnd = fmStart + fmMatch[1]!.length
      let frontmatter = code.slice(fmStart, fmEnd)

      // Try block scalar first, then inline
      frontmatter = frontmatter.replace(GENERATOR_BLOCK_RE, '')
      frontmatter = frontmatter.replace(GENERATOR_INLINE_RE, '')

      // Reconstruct the file
      const result = '---\n' + frontmatter + '\n---' + code.slice(fmEnd + 4) // +4 for "\n---"
      return { code: result, map: null }
    },
  }
}
