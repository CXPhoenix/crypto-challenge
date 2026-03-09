import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RunButton from '../components/editor/RunButton.vue'

describe('RunButton', () => {
  it('shows run button with SVG (no unicode arrow) when not running', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, progress: 0, total: 5 },
    })
    expect(wrapper.find('button').text()).not.toContain('▶')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows stop button with SVG (no unicode square) when running', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: true, progress: 2, total: 5 },
    })
    expect(wrapper.find('button').text()).not.toContain('■')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('emits run on run button click', async () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, progress: 0, total: 5 },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('run')).toBeTruthy()
  })

  it('emits stop on stop button click', async () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: true, progress: 2, total: 5 },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('stop')).toBeTruthy()
  })
})
