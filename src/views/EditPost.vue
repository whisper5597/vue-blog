<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';
import PostForm from '@/components/PostForm.vue';

const route = useRoute();
const post = ref(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (fetchError) throw fetchError;
    post.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文章失败';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="text-center p-8 text-gray-500 dark:text-gray-400">正在加载...</div>
    <div v-else-if="error" class="text-red-500 dark:text-red-400 text-center p-8">{{ error }}</div>
    <PostForm v-else-if="post" :is-edit="true" :initial-data="post" />
  </div>
</template>