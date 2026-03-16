import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChallengeListView from '../views/ChallengeListView.vue'

vi.mock('vitepress', () => ({
  useRouter: () => ({ go: vi.fn() }),
}))

const mockChallenges = [
  { id: 1, title: '凱薩加密', url: '/challenge/caesar-encrypt', difficulty: 'easy', tags: ['classical'] },
  { id: 2, title: 'RSA', url: '/challenge/rsa', difficulty: 'hard', tags: ['asymmetric'] },
]

function mountView() {
  return mount(ChallengeListView, { props: { challenges: mockChallenges } })
}

describe('ChallengeListView', () => {
  it('renders filter buttons', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('button').length).toBeGreaterThan(0)
  })

  it('active filter button has bg-blue-600 as light mode base (Requirement: ChallengeListView filter buttons apply dual-theme styles)', () => {
    const wrapper = mountView()
    // First button ("全部") is active by default
    const activeBtn = wrapper.find('button')
    expect(activeBtn.classes()).toContain('bg-blue-600')
  })

  it('active filter button has dark:bg-emerald-500 for dark mode', () => {
    const wrapper = mountView()
    const activeBtn = wrapper.find('button')
    expect(activeBtn.classes()).toContain('dark:bg-emerald-500')
  })

  it('inactive filter button has bg-blue-50 as light mode base', () => {
    const wrapper = mountView()
    const buttons = wrapper.findAll('button')
    // Second button is inactive
    const inactiveBtn = buttons[1]
    expect(inactiveBtn.classes()).toContain('bg-blue-50')
  })
})
