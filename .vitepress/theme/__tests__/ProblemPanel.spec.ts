import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProblemPanel from '../components/challenge/ProblemPanel.vue'

// ProblemPanel renders VitePress <Content /> (current page markdown).
// Mock vitepress to avoid SSR/esbuild environment issues in jsdom.
vi.mock('vitepress', () => ({
  Content: { template: '<div class="vp-content" />' },
}))

describe('ProblemPanel', () => {
  it('renders the prose wrapper with correct classes', () => {
    const wrapper = mount(ProblemPanel)
    expect(wrapper.find('.prose').exists()).toBe(true)
    expect(wrapper.find('.prose-invert').exists()).toBe(true)
  })

  it('has overflow-auto for scrollable content', () => {
    const wrapper = mount(ProblemPanel)
    expect(wrapper.find('div').classes()).toContain('overflow-auto')
  })
})
