import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TestResultPanel from '../components/editor/TestResultPanel.vue'
import type { TestcaseResult } from '../workers/pyodide.worker'

// Stub ResizeObserver for jsdom
const observeSpy = vi.fn()
const disconnectSpy = vi.fn()
vi.stubGlobal('ResizeObserver', class {
  observe = observeSpy
  disconnect = disconnectSpy
  unobserve = vi.fn()
})

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
  beforeEach(() => {
    observeSpy.mockClear()
    disconnectSpy.mockClear()
  })

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

  // Task 3.4: resizable panel tests
  it('does NOT have fixed max-h-56 class (Requirement: TestResultPanel removes fixed max-height)', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
    })
    expect(wrapper.find('.max-h-56').exists()).toBe(false)
  })

  it('has a drag handle element at the top (Requirement: TestResultPanel height is user-adjustable via drag)', () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
    })
    // Drag handle should exist (data-drag-handle or a dedicated element)
    expect(wrapper.find('[data-drag-handle]').exists()).toBe(true)
  })

  it('clamps height to minimum 80px when dragged too far down', async () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
      attachTo: document.body,
    })
    const vm = wrapper.vm as unknown as { height: number; containerHeight: number }
    // Simulate container height = 400px
    vm.containerHeight = 400
    // Simulate drag that would result in height below minimum
    vm.height = 20 // below 80px minimum
    await wrapper.vm.$nextTick()

    const panelEl = wrapper.find('[data-testid="result-panel"]')
    // Height style should be clamped to at least 80px
    const style = panelEl.attributes('style') ?? ''
    const match = style.match(/height:\s*([\d.]+)px/)
    expect(match).not.toBeNull()
    expect(Number(match![1])).toBeGreaterThanOrEqual(80)
    wrapper.unmount()
  })

  it('clamps height to max 50% of container when dragged too far up', async () => {
    const wrapper = mount(TestResultPanel, {
      props: { results: [makeResult('AC')], status: 'done' },
      attachTo: document.body,
    })
    const vm = wrapper.vm as unknown as { height: number; containerHeight: number }
    vm.containerHeight = 400
    // Simulate drag that would result in height above 50% (200px)
    vm.height = 300
    await wrapper.vm.$nextTick()

    const panelEl = wrapper.find('[data-testid="result-panel"]')
    const style = panelEl.attributes('style') ?? ''
    const match = style.match(/height:\s*([\d.]+)px/)
    expect(match).not.toBeNull()
    expect(Number(match![1])).toBeLessThanOrEqual(200)
    wrapper.unmount()
  })
})
