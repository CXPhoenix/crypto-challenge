import { describe, it, expect } from 'vitest'
import { computeVerdict, buildWrappedCode } from '../workers/worker-utils'

describe('computeVerdict', () => {
  it('returns AC when output matches expected exactly', () => {
    expect(computeVerdict('HELLO', 'HELLO')).toBe('AC')
  })

  it('returns WA when output differs', () => {
    expect(computeVerdict('WORLD', 'HELLO')).toBe('WA')
  })

  it('strips trailing newline before comparing', () => {
    expect(computeVerdict('HELLO\n', 'HELLO')).toBe('AC')
  })

  it('strips trailing whitespace before comparing', () => {
    expect(computeVerdict('HELLO  \n', 'HELLO')).toBe('AC')
  })

  it('is case-sensitive', () => {
    expect(computeVerdict('hello', 'HELLO')).toBe('WA')
  })
})

describe('buildWrappedCode', () => {
  it('includes sys.settrace injection with the given op limit', () => {
    const code = buildWrappedCode('print("hi")', '42', 10_000_000)
    expect(code).toContain('sys.settrace')
    expect(code).toContain('10000000')
  })

  it('includes stdin simulation with the given input', () => {
    const code = buildWrappedCode('x = input()', 'hello world', 10_000_000)
    expect(code).toContain('io.StringIO')
    expect(code).toContain('hello world')
  })

  it('includes stdout capture via StringIO', () => {
    const code = buildWrappedCode('print("test")', '', 10_000_000)
    expect(code).toContain('_captured_stdout')
    expect(code).toContain('_output')
  })

  it('includes the user code verbatim', () => {
    const userCode = 'def solve(x):\n    return x * 2\nprint(solve(int(input())))'
    const code = buildWrappedCode(userCode, '5', 10_000_000)
    expect(code).toContain(userCode)
  })

  it('removes sys.settrace after user code runs', () => {
    const code = buildWrappedCode('pass', '', 10_000_000)
    expect(code).toContain('sys.settrace(None)')
  })
})
