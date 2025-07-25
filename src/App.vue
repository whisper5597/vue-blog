<template>
  <div class="min-h-screen">
    <Navbar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<style>
/* 移除 App.vue 的局部样式，因为我们已经在 style.css 中设置了全局样式 */
</style>
