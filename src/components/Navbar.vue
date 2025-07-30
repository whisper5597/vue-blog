<template>
  <nav class="bg-white shadow-md dark:bg-gray-800">
    <div class="container mx-auto px-6 py-3 flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold text-primary dark:text-white">首页</router-link>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <router-link to="/create"
              class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white">写点什么</router-link>
            <button @click="handleLogout"
              class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white">退出</button>
          </template>
          <template v-else>
            <router-link to="/login"
              class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white">登录</router-link>
            <router-link to="/register"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">注册</router-link>
          </template>
        </div>
        <!-- Theme Toggle Button -->
        <button @click="toggleTheme" class="text-gray-600 dark:text-gray-300 focus:outline-none">
          <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { user, supabase } from '../lib/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const theme = ref('light');

const applyTheme = (newTheme: string) => {
  theme.value = newTheme;
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', newTheme);
};

const toggleTheme = () => {
  applyTheme(theme.value === 'light' ? 'dark' : 'light');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDark) {
    applyTheme('dark');
  }
});

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};
</script>
