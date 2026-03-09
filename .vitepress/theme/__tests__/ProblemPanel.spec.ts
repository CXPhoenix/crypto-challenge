import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProblemPanel from '../components/challenge/ProblemPanel.vue'

describe('ProblemPanel', () => {
  it('renders markdown headings as HTML heading elements', () => {
    const wrapper = mount(ProblemPanel, { props: { markdown: '## 測試標題' } })
    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('renders inline LaTeX wrapped in katex span', () => {
    const wrapper = mount(ProblemPanel, {
      props: { markdown: '公式：$c = m^e$' },
    })
    // KaTeX renders into .katex spans
    expect(wrapper.html()).toContain('katex')
  })

  it('renders block LaTeX as display math', () => {
    const wrapper = mount(ProblemPanel, {
      props: { markdown: '$$c = m^e \\bmod n$$' },
    })
    expect(wrapper.html()).toContain('katex-display')
  })

  it('returns empty string when markdown prop is empty', () => {
    const wrapper = mount(ProblemPanel, { props: { markdown: '' } })
    expect(wrapper.find('.prose').text()).toBe('')
  })
})
