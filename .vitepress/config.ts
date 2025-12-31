import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Multivac 42',
  description: '研究與寫作',
  lang: 'zh-TW',
  srcDir: 'docs',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: '首頁', link: '/' },
      { text: '文章', link: '/articles/' },
      { text: '研究', link: '/research/' },
      { text: '關於', link: '/about' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Clementtang/multivac42' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: '以 VitePress 建置',
      copyright: '© 2025 Clement Tang'
    }
  }
})
