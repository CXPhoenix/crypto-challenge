import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TestResultPanel from '../components/editor/TestResultPanel.vue'
import type { TestcaseResult } from '../workers/pyodide.worker'

function makeResult(verdict: string): TestcaseResult {
  return {
    index: 0,
    verdict: verdict as TestcaseResult['verdict'],
    elapsed_ms: 10,
    actual: 'X',
    expected: 'Y',
    error: '',
  }
}

describe('TestResultPanel', () => {
  it('renders AC row with a checkmark SVG', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
    })
    const row = wrapper.find('tbody tr')
    expect(row.find('svg').exists()).toBe(true)
  })

  it('renders WA row with a failure SVG', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('WA')], status: 'done' },
    })
    const row = wrapper.find('tbody tr')
    expect(row.find('svg').exists()).toBe(true)
  })

  it('shows nothing when results are empty and status is idle', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [], status: 'idle' },
    })
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('does NOT have fixed max-h-56 class (Requirement: TestResultPanel removes fixed max-height)', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
    })
    expect(wrapper.find('.max-h-56').exists()).toBe(false)
  })
})
