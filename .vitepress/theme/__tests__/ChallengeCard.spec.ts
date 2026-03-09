import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ChallengeCard from '../components/challenge/ChallengeCard.vue'

const mockChallenge = {
  id: 'caesar-encrypt',
  title: '凱薩加密',
  difficulty: 'easy',
  tags: ['classical'],
  toml: '',
}

function mountCard() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  return mount(ChallengeCard, {
    props: { challenge: mockChallenge },
    global: { plugins: [router] },
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
