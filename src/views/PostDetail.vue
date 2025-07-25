<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // <--- 修改这里

const route = useRoute();
const router = useRouter();
const post = ref<any>(null);
const user = ref<any>(null);
const isLoading = ref(true);
const error = ref('');

const md = new MarkdownIt();

md.options.highlight = function (str, lang) {
  const langName = lang || 'text';
  // 移除 pre 标签外层的包裹 div，让 pre 标签作为根容器
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlightedCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      return (
        '<div class="code-block-wrapper relative group">' +
        '<div class="code-block-header flex justify-between items-center px-4 py-2 bg-[#3c3c3c] text-gray-300 rounded-t-md">' +
        `<span class="font-mono text-sm">${langName}</span>` +
        '<button class="copy-code-btn bg-gray-700 hover:bg-gray-600 text-xs font-medium text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">复制</button>' +
        '</div>' +
        `<pre class="hljs !bg-[#252526] !text-white rounded-b-md p-4 overflow-x-auto m-0"><code>${highlightedCode}</code></pre>` +
        '</div>'
      );
    } catch (__) { }
  }

  const escapedHtml = md.utils.escapeHtml(str);
  return (
    '<div class="code-block-wrapper relative group">' +
    '<div class="code-block-header flex justify-between items-center px-4 py-2 bg-[#3c3c3c] text-gray-300 rounded-t-md">' +
    `<span class="font-mono text-sm">${langName}</span>` +
    '<button class="copy-code-btn bg-gray-700 hover:bg-gray-600 text-xs font-medium text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">复制</button>' +
    '</div>' +
    `<pre class="hljs !bg-[#252526] !text-white rounded-b-md p-4 overflow-x-auto m-0"><code>${escapedHtml}</code></pre>` +
    '</div>'
  );
};

const renderedContent = computed(() => {
  if (post.value && post.value.content) {
    console.log(md.render(post.value.content));
    return md.render(post.value.content);
  }
  return '';
});

onMounted(async () => {
  try {
    isLoading.value = true;
    const postId = route.params.id as string;

    // 获取文章数据
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError) throw postError;
    post.value = postData;

    // 获取当前登录用户
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    user.value = currentUser;

  } catch (err: any) {
    error.value = err.message || '加载文章失败';
  } finally {
    isLoading.value = false;
  }
});

const handleContentClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('copy-code-btn')) {
    const wrapper = target.closest('.code-block-wrapper');
    if (wrapper) {
      const code = wrapper.querySelector('code')?.innerText;
      if (code) {
        try {
          await navigator.clipboard.writeText(code);
          target.textContent = '已复制!';
          setTimeout(() => {
            target.textContent = '复制';
          }, 2000);
        } catch (err) {
          console.error('复制失败:', err);
          target.textContent = '失败';
        }
      }
    }
  }
};

const handleDelete = async () => {
  if (!post.value || !user.value || !confirm('确定要删除这篇文章吗？')) {
    return;
  }

  try {
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.value.id)
      .eq('author_id', user.value.id);

    if (deleteError) throw deleteError;
    router.push('/');
  } catch (err: any) {
    error.value = err.message || '删除文章失败';
    alert(error.value);
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-4">
    <button @click="router.push('/')"
      class="mb-6 inline-flex items-center text-blue-500 hover:underline dark:text-blue-400 dark:hover:underline">
      ← 返回列表
    </button>

    <div v-if="isLoading" class="text-center dark:text-gray-300">
      <p>加载中...</p>
    </div>

    <div v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-800 dark:border-red-600 dark:text-red-300"
      role="alert">
      <strong class="font-bold">出错了!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="post" class="prose max-w-none dark:prose-invert">
      <div v-if="user && post.author_id === user.id" class="mb-6 flex gap-4 not-prose">
        <router-link :to="{ name: 'EditPost', params: { id: post.id } }"
          class="text-blue-400 border border-blue-400 rounded px-4 py-2 hover:bg-blue-400 hover:text-gray-900 transition-colors">
          编辑文章
        </router-link>
        <button @click="handleDelete"
          class="text-red-400 border border-red-400 rounded px-4 py-2 hover:bg-red-400 hover:text-gray-900 transition-colors">
          删除文章
        </button>
      </div>

      <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
      <p class="text-gray-500 text-sm mb-6 dark:text-gray-400">{{ new Date(post.created_at).toLocaleString() }}</p>
      <div class="prose max-w-none dark:prose-invert" v-html="renderedContent" @click="handleContentClick"></div>
    </div>

    <div v-else class="text-center dark:text-gray-300">
      <p>文章未找到。</p>
    </div>
  </div>
</template>