import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import App from '../App.vue'
import pinia from '../stores/index.js'
import router from '../router/index.js'

describe('App', () => {
  it('renders the landing page', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Trading Journal')
  })
})
