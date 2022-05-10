/* eslint-disable import/no-extraneous-dependencies */
import {defineUserConfig} from 'vuepress';
import {defaultTheme} from '@vuepress/theme-default';
import {path} from '@vuepress/utils';

export default defineUserConfig({
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
            link: '/designed/micro-module',
          },
          {
            text: '开发指南',
            link: '/guide/summary',
          },
          {
            text: 'API文档',
            link: '/api',
          },
          {
            text: 'CLI工具',
            link: '/api',
          },
        ],
        sidebar: [
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
                link: '/guide/basics.md',
              },
              {
                text: '案例',
                children: [
                  {
                    text: '划分模块',
                    link: '/guide/case-module.md',
                  },
                ],
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
    '@theme/HomeHero.vue': path.resolve(__dirname, './components/HomeHero.vue'),
    '@theme/HomeFeatures.vue': path.resolve(__dirname, './components/HomeFeatures.vue'),
    '@theme/HomeFooter.vue': path.resolve(__dirname, './components/HomeFooter.vue'),
  },
});
