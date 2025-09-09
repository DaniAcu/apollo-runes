import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Svelte Apollo',
  description: 'Apollo Client integration for Svelte 5 with runes support',
  
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/installation' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Quick Start', link: '/guide/getting-started' }
        ]
      },
      {
        text: 'Operations',
        items: [
          { text: 'Query', link: '/operations/query' },
          { text: 'Mutation', link: '/operations/mutation' },
          { text: 'Subscription', link: '/operations/subscription' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Error Handling', link: '/advanced/error-handling' },
          { text: 'SSR', link: '/advanced/ssr' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/svelte-apollo' }
    ],
  }
})
