<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300 mb-2" for="email">邮箱</label>
        <input v-model="email" type="email" id="email"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300 mb-2" for="username">用户名</label>
        <input v-model="username" type="text" id="username"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 dark:text-gray-300 mb-2" for="password">密码</label>
        <input v-model="password" type="password" id="password"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" required
          minlength="6" />
      </div>
      <button type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
        注册
      </button>
      <p class="mt-4 text-center text-gray-600 dark:text-gray-400">
        已有账号？<router-link to="/login"
          class="text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300">登录</router-link>
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
const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleRegister = async () => {
  try {
    error.value = '';
    // 创建用户
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (authError || !user) throw authError || new Error('注册失败');

    // 创建用户资料
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: user.id, username: username.value }]);

    if (profileError) throw profileError;
    router.push('/login?registered=true');
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    }
  }
};
</script>