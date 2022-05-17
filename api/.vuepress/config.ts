/* eslint-disable import/no-extraneous-dependencies */
import {defineUserConfig} from 'vuepress';
import {defaultTheme} from '@vuepress/theme-default';
import {path} from '@vuepress/utils';

export default defineUserConfig({
  shouldPrefetch: false,
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Hello-Elux',
      description: 'Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架同构方案',
    },
    '/en/': {
      lang: 'en-US',
      title: 'Hello-Elux',
      description: 'Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架同构方案',
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
            text: 'API文档',
            link: '/api/',
          },
          {
            text: 'CLI工具',
            link: '/cli/',
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
