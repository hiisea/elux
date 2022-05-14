/* eslint-disable import/no-extraneous-dependencies */
import {defineUserConfig} from 'vuepress';
import {defaultTheme} from '@vuepress/theme-default';
import {path} from '@vuepress/utils';

export default defineUserConfig({
  shouldPrefetch: false,
  // shouldPrefetch: (file, type) => {
  //   if (file.startsWith('assets/vue-web.') || file.startsWith('assets/vue-taro.')) {
  //     return false;
  //   }
  //   return true;
  // },
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
    logo: '/images/logo-2.svg',
    repo: 'hiisea/elux',
    docsDir: 'docs',
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
        sidebar: {
          '/': [
            {
              text: '设计思想',
              children: [
                {
                  text: '微模块',
                  link: '/designed/micro-module',
                },
                {
                  text: '模型驱动',
                  link: '/designed/model-driven',
                },
                {
                  text: '路由与历史',
                  link: '/designed/route-history',
                },
              ],
            },
            {
              text: '开发指南',
              children: [
                {
                  text: '介绍',
                  link: '/guide/summary',
                },
                {
                  text: '安装',
                  link: '/guide/install',
                },
                {
                  text: '配置',
                  link: '/guide/configure',
                },
                {
                  text: '基础',
                  children: [
                    {
                      text: '概述',
                      link: '/guide/basics/summary.md',
                    },
                    {
                      text: 'Module',
                      link: '/guide/basics/module.md',
                    },
                    {
                      text: 'Model',
                      link: '/guide/basics/model.md',
                    },
                    {
                      text: 'Store',
                      link: '/guide/basics/store.md',
                    },
                    {
                      text: 'Action与Handler',
                      link: '/guide/basics/action.md',
                    },
                    {
                      text: 'Component与View',
                      link: '/guide/basics/view.md',
                    },
                    {
                      text: 'Router',
                      link: '/guide/basics/router.md',
                    },
                  ],
                },
                {
                  text: 'UI框架',
                  children: [
                    {
                      text: 'React',
                      link: '/guide/ui-framework/react.md',
                    },
                    {
                      text: 'Vue',
                      link: '/guide/ui-framework/vue.md',
                    },
                  ],
                },
                {
                  text: 'CSS框架',
                  link: '/guide/css.md',
                },
                {
                  text: '微前端',
                  link: '/guide/css.md',
                },
                {
                  text: '跨平台',
                  children: [
                    {
                      text: 'SSR服务器渲染',
                      link: '/guide/ui-framework/react.md',
                    },
                    {
                      text: 'Taro小程序',
                      link: '/guide/ui-framework/vue.md',
                    },
                  ],
                },
                {
                  text: 'DevTools',
                  link: '/guide/dev-tools.md',
                },
              ],
            },
          ],
          '/api/': [
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
      },
      '/en/': {
        selectLanguageName: 'English',
      },
    },
  }),
  alias: {
    '@theme/HomeHero.vue': path.resolve(__dirname, './components/HomeHero.vue'),
    '@theme/HomeFeatures.vue': path.resolve(__dirname, './components/HomeFeatures.vue'),
    '@theme/HomeFooter.vue': path.resolve(__dirname, './components/HomeFooter.vue'),
  },
});
