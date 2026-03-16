import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RunButton from '../components/editor/RunButton.vue'

describe('RunButton', () => {
  it('shows run button with SVG (no unicode arrow) when not running', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: true, progress: 0, total: 5 },
    })
    expect(wrapper.find('button').text()).not.toContain('▶')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows stop button with SVG (no unicode square) when running', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: true, isReady: true, progress: 2, total: 5 },
    })
    expect(wrapper.find('button').text()).not.toContain('■')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('emits run on run button click', async () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: true, progress: 0, total: 5 },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('run')).toBeTruthy()
  })

  it('emits stop on stop button click', async () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: true, isReady: true, progress: 2, total: 5 },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('stop')).toBeTruthy()
  })

  // Task 2.3: isReady prop — disabled state when testcases not yet generated
  it('shows loading/disabled state when isReady is false (Requirement: Run button is disabled until testcases are ready)', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: false, progress: 0, total: 0 },
    })
    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toContain('生成中')
  })

  it('is enabled and shows run icon when isReady is true', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: true, progress: 0, total: 5 },
    })
    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toContain('執行')
  })

  it('loading state has light mode base bg-slate-100 (Requirement: TestResultPanel and RunButton apply dual-theme styles)', () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: false, progress: 0, total: 0 },
    })
    expect(wrapper.find('button').classes()).toContain('bg-slate-100')
  })

  it('does not emit run when isReady is false and clicked', async () => {
    const wrapper = mount(RunButton, {
      props: { isRunning: false, isReady: false, progress: 0, total: 0 },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('run')).toBeFalsy()
  })
})
