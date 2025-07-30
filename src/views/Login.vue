<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300 mb-2" for="email">邮箱</label>
        <input v-model="email" type="email" id="email"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 dark:text-gray-300 mb-2" for="password">密码</label>
        <input v-model="password" type="password" id="password"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required />
      </div>
      <button type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
        登录
      </button>
      <p class="mt-4 text-center text-gray-600 dark:text-gray-400">
        还没有账号？<router-link to="/register" class="text-blue-500 hover:underline">注册</router-link>
      </p>
    </form>
    <div v-if="error" class="mt-4 text-red-500 dark:text-red-400 text-center">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabase';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    error.value = '';
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;
    // 检查上一页的路由
    const previousRoute = router.options.history.state.back;
    // 如果上一页是注册页，或者没有上一页，则跳转到首页
    if (!previousRoute || typeof previousRoute === 'string' && previousRoute.startsWith('/register')) {
      router.push('/');
    } else {
      // 否则，返回到上一页
      router.back();
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    }
  }
};
</script>
