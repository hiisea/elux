/* eslint-disable import/no-extraneous-dependencies */
import {defaultTheme} from '@vuepress/theme-default';
import {path} from '@vuepress/utils';
import {defineUserConfig} from 'vuepress';

export default defineUserConfig({
  shouldPrefetch: false,
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: `/images/logo-16x.png`,
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `/images/logo-32x.png`,
      },
    ],
    ['meta', {name: 'application-name', content: 'EluxJS'}],
    ['meta', {name: 'apple-mobile-web-app-title', content: 'EluxJS'}],
  ],
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'EluxJS',
      description: 'Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架同构方案',
    },
    '/en/': {
      lang: 'en-US',
      title: 'EluxJS',
      description: 'Cross platform and cross framework web solutions that based on micro-module and model-driven',
    },
  },
  theme: defaultTheme({
    darkMode: false,
    editLink: false,
    logo: '/images/logo-2.svg',
    repo: 'hiisea/elux',
    docsDir: 'api',
    locales: {
      '/': {
        selectLanguageName: '简体中文',
        navbar: [
          {
            text: '设计思想',
            link: '/designed/micro-module.html',
          },
          {
            text: '开发指南',
            link: '/guide/summary.html',
          },
          {
            text: '生态建设',
            link: '/ecological/',
          },
          {
            text: 'API文档',
            link: '/api/',
          },
          {
            text: `v2.0`,
            children: [
              {
                text: '更新日志',
                link: 'https://github.com/hiisea/elux/blob/main/CHANGELOG.md',
              },
            ],
          },
          {
            text: `Git仓库`,
            children: [
              {
                text: 'Github',
                link: 'https://github.com/hiisea/elux',
              },
              {
                text: 'Gitee',
                link: 'https://gitee.com/hiisea/elux-fork',
              },
            ],
          },
        ],
        sidebar: [
          {
            text: 'API手册',
            children: [
              {
                text: '@elux/react-web',
                link: '/api/react-web.md',
              },
              {
                text: '@elux/react-taro',
                link: '/api/react-taro.md',
              },
              {
                text: '@elux/vue-web',
                link: '/api/vue-web.md',
              },
              {
                text: '@elux/vue-taro',
                link: '/api/vue-taro.md',
              },
            ],
          },
        ],
      },
      '/en/': {
        selectLanguageName: 'English',
      },
    },
  }),
  alias: {
    '@theme/NavbarBrand.vue': path.resolve(__dirname, './components/NavbarBrand.vue'),
    '@theme/NavbarItems.vue': path.resolve(__dirname, './components/NavbarItems.vue'),
  },
});
