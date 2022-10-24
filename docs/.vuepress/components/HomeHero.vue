<script setup lang="ts">
import AutoLink from '@theme/AutoLink.vue';
import {ClientOnly, usePageFrontmatter, useSiteLocaleData, withBase} from '@vuepress/client';
import {isArray} from '@vuepress/shared';
import type {DefaultThemeHomePageFrontmatter} from '@vuepress/theme-default/lib/shared';
import type {FunctionalComponent} from 'vue';
import {computed, h} from 'vue';

const frontmatter = usePageFrontmatter<DefaultThemeHomePageFrontmatter>();
const siteLocale = useSiteLocaleData();

const actions = computed(() => {
  if (!isArray(frontmatter.value.actions)) {
    return [];
  }

  return frontmatter.value.actions.map(({text, link, type = 'primary'}) => ({
    text,
    link,
    type,
  }));
});
</script>

<template>
  <header class="hero">
    <ul class="hero-notice">
      <li>
        新增基于React+Antd的管理系统模版（
        <a href="https://github.com/hiisea/elux-react-antd-admin" target="_blank">Github</a><span>｜</span
        ><a href="https://gitee.com/hiisea/elux-react-antd-admin-fork" target="_blank">Gitee</a>）
      </li>
      <li>
        新增基于Vue+Antd的管理系统模版（
        <a href="https://github.com/hiisea/elux-vue-antd-admin" target="_blank">Github</a><span>｜</span
        ><a href="https://gitee.com/hiisea/elux-vue-antd-admin-fork" target="_blank">Gitee</a>）
      </li>
    </ul>
    <div class="hero-logo">
      <img class="logo-icon" src="/images/logo-icon-rotate.svg" alt="elux" width="250" />
      <img class="logo-text" src="/images/logo-text.svg" alt="elux" width="230" />
    </div>
    <h1 class="hero-description">基于“微模块”和“模型驱动”的跨平台、跨框架『同构方案』</h1>
    <p v-if="actions.length" class="actions">
      <AutoLink v-for="action in actions" :key="action.text" class="action-button" :class="[action.type]" :item="action" />
    </p>
    <div class="hero-summary">
      <section>
        <h2>微模块</h2>
        <p>以业务功能的高内聚低耦合划分微模块，各微模块可独立自治、灵活拆装、按需加载、版本控制，是一种更自由、更细粒度的微前端...</p>
      </section>
      <section>
        <h2>模型驱动</h2>
        <p>以业务逻辑的数据模型作为核心驱动，减少对运行平台、UI框架的强依赖和干挠，是领域驱动在前端开发的白话版、简化版、落地版...</p>
      </section>
    </div>
    <div><img src="/images/hero-photo.png" alt="elux-微模块-模型驱动" width="500" class="hero-photo" /></div>
  </header>
</template>
