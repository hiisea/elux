<script setup lang="ts"></script>

<template>
  <div class="feats">
    <h2>一站式跨平台、跨框架<span class="stress">同构</span></h2>
    <div class="feats-cross">
      <ul class="framework">
        <li class="react">React</li>
        <li class="vue">Vue</li>
        <li class="taro">Taro</li>
        <li class="rn">ReactNative</li>
        <li class="more">...</li>
      </ul>
      <p class="anywhere">Learn Once, Write Anywhere...</p>
      <ul class="platform">
        <li><span class="iconfont icon-laptop" style="font-size: 38px"></span>Web(浏览器)</li>
        <li><span class="iconfont icon-all" style="font-size: 38px"></span>Micro(微前端)</li>
        <li><span class="iconfont icon-cloud-server"></span>SSR(服务器渲染)</li>
        <li><span class="iconfont icon-mini-program"></span>MP(小程序)</li>
        <li><span class="iconfont icon-mobile" style="font-size: 38px"></span>APP(手机应用)</li>
      </ul>
    </div>
    <h2>独创基于<span class="stress">双栈单链</span>的“虚拟路由”+“虚拟多页”</h2>
    <div class="feats-router">
      <div>Elux抹平了各平台、各UI库中路由的千差万别，实现了统一的带二维历史栈的虚拟路由，并催生出独有的虚拟多页，让单页和多页彼此扬长避短...</div>
      <div class="item">
        <div class="item-hd">
          <div class="title">
            <h4>单页应用</h4>
            <em>single-page application</em>
          </div>
          <cite>SPA</cite>
        </div>
        <ul class="item-bd">
          <li>共享同一个Runtime，灵活可控 👍</li>
          <li>局部刷新、更友好的用户体验 👍</li>
          <li>更新时元素被替换，回退时需重建(信息丢失) 👎</li>
          <li>数据和状态被不断增量累积，难以清理 👎</li>
        </ul>
      </div>
      <div class="item">
        <div class="item-hd">
          <cite>MPA</cite>
          <div class="title">
            <h4>多页应用</h4>
            <em>multi-page application</em>
          </div>
        </div>
        <ul class="item-bd">
          <li>👍 可保持原页面而打开新页面，便于快速回退</li>
          <li>👍 页面彼此隔离，更新简单，运行时随页面而销毁</li>
          <li>👎 页面间交互和通讯能力弱，可操控性不足</li>
          <li>👎 多个页面使内存开销增大，容易导致用户迷路</li>
        </ul>
      </div>
    </div>
    <h2>使用既有技术栈，提供<span class="stress">CLI工具</span>开箱即用</h2>
    <div class="feats-easy">
      <div class="note">
        <h5 class="title">Cli模版持续增加中...</h5>
        <ul>
          <li>CSR: 基于浏览器渲染的Web应用</li>
          <li>SSR: 基于服务器渲染 + 浏览器渲染的同构应用</li>
          <li>Micro: 基于ModuleFederation的“微前端”方案</li>
          <li>Model: 基于模型驱动，React与Vue跨项目共用Model</li>
          <li>Taro: 基于Taro的跨平台应用（各类小程序）</li>
          <li>RN: 基于ReactNative的原生APP</li>
          <li>ANTD: 基于Ant-Design的React/Vue后台管理系统</li>
        </ul>
      </div>
      <div class="cli"></div>
    </div>
    <h2>只需一行命令，立即试试吧！👇</h2>
    <div class="try-now">npm create elux@latest 或 yarn create elux</div>
  </div>
</template>
