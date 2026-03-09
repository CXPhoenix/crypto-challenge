import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChallengeCard from '../components/challenge/ChallengeCard.vue'

vi.mock('vitepress', () => ({
  useRouter: () => ({ go: vi.fn() }),
}))

const mockChallenge = {
  id: 1,
  title: '凱薩加密',
  url: '/challenge/caesar-encrypt',
  difficulty: 'easy',
  tags: ['classical'],
}

function mountCard() {
  return mount(ChallengeCard, {
    props: { challenge: mockChallenge },
  })
}

describe('ChallengeCard', () => {
  it('has cursor-pointer class', () => {
    const wrapper = mountCard()
    expect(wrapper.find('button').classes()).toContain('cursor-pointer')
  })

  it('has transition class for smooth hover animation', () => {
    const wrapper = mountCard()
    const btn = wrapper.find('button')
    expect(btn.classes().some((c) => c.startsWith('transition'))).toBe(true)
  })

  it('renders difficulty badge', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('簡單')
  })

  it('renders tags', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('classical')
  })
})
