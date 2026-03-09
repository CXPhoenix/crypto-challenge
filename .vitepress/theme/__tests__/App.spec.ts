import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders RouterView', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div>home</div>' } }],
    })
    const wrapper = mount(App, { global: { plugins: [router, createPinia()] } })
    expect(wrapper.exists()).toBe(true)
  })
})
