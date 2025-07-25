<script setup lang="ts">
import { supabase } from '@/lib/supabase';
import { ref, onMounted, computed } from 'vue';

const posts = ref<any[]>([]);
const loading = ref(true);
const yiyan = ref('');
const searchQuery = ref('');

// --- 分页状态 ---
const currentPage = ref(1);
const postsPerPage = 10; // 每页显示的文章数量
const totalPosts = ref(0);

// --- 计算属性 ---
const totalPages = computed(() => {
  return Math.ceil(totalPosts.value / postsPerPage);
});

async function fetchYiyan() {
  try {
    const YI_YAN_KEY = import.meta.env.VITE_YI_YAN_KEY;
    const response = await fetch(`https://api.oick.cn/api/yiyan?apikey=${YI_YAN_KEY}`);
    if (response.ok) {
      const data = await response.json();
      yiyan.value = data;
    } else {
      yiyan.value = '无法获取随机一言，但愿你今天过得愉快。';
    }
  } catch (error) {
    console.error('Error fetching yiyan:', error);
    yiyan.value = '网络似乎有些问题，但生活仍在继续。';
  }
}

async function getPosts() {
  loading.value = true;
  const startIndex = (currentPage.value - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage - 1;

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles ( username, avatar_url )
    `)

  if (searchQuery.value) {
    query = query.or(`title.ilike.%${searchQuery.value}%,description.ilike.%${searchQuery.value}%`);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(startIndex, endIndex); // 使用 range 实现分页查询

  if (error) {
    console.error('Error fetching posts:', error);
  } else {
    posts.value = data || [];
  }
  loading.value = false;
}

async function getTotalPostsCount() {
  let query = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (searchQuery.value) {
    query = query.or(`title.ilike.%${searchQuery.value}%,description.ilike.%${searchQuery.value}%`);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error getting total posts count:', error);
  } else {
    totalPosts.value = count || 0;
  }
}

// --- 搜索处理 ---
function handleSearch() {
  currentPage.value = 1; // 开始新的搜索时，重置到第一页
  getTotalPostsCount();
  getPosts();
}

// --- 分页导航 ---
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    getPosts();
  }
}

onMounted(() => {
  getTotalPostsCount(); // 先获取总数
  getPosts();
  fetchYiyan();
});
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="relative text-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-lg">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img src="https://api.oick.cn/api/bing" alt="Background" class="w-full h-full object-cover filter blur-sm">
        <div class="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <!-- Content -->
      <div class="relative z-10">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          一个平平无奇的博客
        </h1>
        <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-200">
          {{ yiyan || '正在加载...' }}
        </p>
      </div>
    </div>

    <!-- Posts List -->
    <div class="mt-16">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">最新文章</h2>
        <input type="text" v-model="searchQuery" @keydown.enter="handleSearch" placeholder="搜索文章..."
          class="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-3/5 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200" />
      </div>
      <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400">
        <p>正在加载文章...</p>
      </div>
      <div v-else-if="posts.length > 0" class="grid gap-12">
        <!-- 只修改显示文章内容的部分 -->
        <div v-for="post in posts" :key="post.id"
          class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
          <router-link :to="{ name: 'PostDetail', params: { id: post.id } }">
            <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ post.title }}</h3>
              <!-- 使用description替代content -->
              <p class="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{{ post.description }}</p>
              <div class="flex items-center mt-4">
                <!-- 假设有作者信息 -->
                <div v-if="post.author" class="flex items-center">
                  <!-- <img class="h-10 w-10 rounded-full object-cover mr-3" :src="post.author.avatar_url" alt=""> -->
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-300">{{ post.author.username }}</span>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-auto">{{ new
                  Date(post.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400">
        <p>还没有任何文章。</p>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center space-x-4">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-800">
          上一页
        </button>
        <span class="text-gray-600 dark:text-gray-400">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-800">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>