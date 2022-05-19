/* eslint-disable import/no-extraneous-dependencies */
import {defineUserConfig} from 'vuepress';
import {defaultTheme} from '@vuepress/theme-default';
import {path} from '@vuepress/utils';

export default defineUserConfig({
  // shouldPrefetch: false,
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
            link: 'http://eluxjs.com/api/',
          },
          {
            text: '生态建设',
            link: '/ecological/',
          },
        ],
        sidebarDepth: 0,
        sidebar: {
          '/': [
            {
              text: '设计思想',
              children: [
                {
                  text: '微模块',
                  link: '/designed/micro-module.html',
                },
                {
                  text: '模型驱动',
                  link: '/designed/model-driven.html',
                },
                {
                  text: '路由与历史',
                  link: '/designed/route-history.html',
                },
              ],
            },
            {
              text: '开发指南',
              children: [
                {
                  text: '介绍',
                  link: '/guide/summary.html',
                },
                {
                  text: '安装',
                  link: '/guide/install.html',
                },
                {
                  text: '配置',
                  link: '/guide/configure.html',
                },
                {
                  text: '基础',
                  children: [
                    {
                      text: '概述',
                      link: '/guide/basics/summary.html',
                    },
                    {
                      text: 'Module',
                      link: '/guide/basics/module.html',
                    },
                    {
                      text: 'Model',
                      link: '/guide/basics/model.html',
                    },
                    {
                      text: 'Store',
                      link: '/guide/basics/store.html',
                    },
                    {
                      text: 'Action与Handler',
                      link: '/guide/basics/action.html',
                    },
                    {
                      text: 'Component与View',
                      link: '/guide/basics/view.html',
                    },
                    {
                      text: 'Router',
                      link: '/guide/basics/router.html',
                    },
                    {
                      text: 'Mutable与Immutable',
                      link: '/guide/basics/immutable.html',
                    },
                  ],
                },
                {
                  text: 'UI框架',
                  children: [
                    {
                      text: 'React',
                      link: '/guide/ui-framework/react.html',
                    },
                    {
                      text: 'Vue',
                      link: '/guide/ui-framework/vue.html',
                    },
                  ],
                },
                {
                  text: 'CSS框架',
                  link: '/guide/css.html',
                },
                {
                  text: '微前端与微模块',
                  link: '/guide/mfd.html',
                },
                {
                  text: '跨平台',
                  children: [
                    {
                      text: 'SSR服务器渲染',
                      link: '/guide/platform/ssr.html',
                    },
                    {
                      text: 'Taro小程序',
                      link: '/guide/platform/taro.html',
                    },
                  ],
                },
                {
                  text: '兼容浏览器',
                  link: '/guide/demote.html',
                },
                {
                  text: 'DevTools',
                  link: '/guide/dev-tools.html',
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
