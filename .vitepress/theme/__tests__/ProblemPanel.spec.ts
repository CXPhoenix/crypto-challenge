import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProblemPanel from '../components/challenge/ProblemPanel.vue'

// ProblemPanel renders VitePress <Content /> (current page markdown).
// Mock vitepress to avoid SSR/esbuild environment issues in jsdom.
vi.mock('vitepress', () => ({
  Content: { template: '<div class="vp-content" />' },
}))

describe('ProblemPanel', () => {
  it('renders the prose wrapper with correct classes (Requirement: ProblemPanel prose mode adapts to theme)', () => {
    const wrapper = mount(ProblemPanel)
    expect(wrapper.find('.prose').exists()).toBe(true)
    // prose-invert is applied via dark: prefix, not unconditionally
    const proseEl = wrapper.find('.prose')
    expect(proseEl.classes()).toContain('dark:prose-invert')
    expect(proseEl.classes()).not.toContain('prose-invert')
  })

  it('has overflow-auto for scrollable content', () => {
    const wrapper = mount(ProblemPanel)
    expect(wrapper.find('div').classes()).toContain('overflow-auto')
  })

  it('has vp-doc class on prose wrapper to activate VitePress code block styles (Requirement: ProblemPanel code blocks render with VitePress styles)', () => {
    const wrapper = mount(ProblemPanel)
    expect(wrapper.find('.vp-doc').exists()).toBe(true)
  })
})
