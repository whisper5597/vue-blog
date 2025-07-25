<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => ({ title: '', description: '', content: '' }),
  },
});

const title = ref('');
const description = ref('');
const content = ref('');
const isLoading = ref(false);
const error = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const router = useRouter();

// 监听 initialData 的变化，并更新表单字段
watch(() => props.initialData, (newData) => {
  if (newData) {
    title.value = newData.title || '';
    description.value = newData.description || '';
    content.value = newData.content || '';
  }
}, { immediate: true, deep: true });

const generateSlug = (title: string) => {
  const randomString = Math.random().toString(36).substring(2, 7);
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
  return `${baseSlug}-${randomString}`;
};

const handleImageUpload = async (file: File) => {
  if (!file) return;

  // --- 新增：客户端文件验证 ---
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    error.value = `只允许上传 JPG, PNG, 或 GIF 格式的图片。`;
    return;
  }

  if (file.size > maxSizeInBytes) {
    error.value = `文件大小不能超过 ${maxSizeInMB}MB。`;
    return;
  }
  // --- 验证结束 ---

  const fileName = `${Date.now()}-${file.name}`;
  const { data, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (uploadError) {
    error.value = `图片上传失败: ${uploadError.message}`;
    return;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  const markdownImage = `![${file.name}](${publicUrl})`;
  const textarea = textareaRef.value;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + markdownImage + text.substring(end);
    content.value = textarea.value; // 更新 content ref
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
  }
};

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    handleImageUpload(target.files[0]);
  }
};

const onPaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (items) {
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          handleImageUpload(blob);
        }
        event.preventDefault();
        break;
      }
    }
  }
};

onMounted(() => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.addEventListener('paste', onPaste);
  }
});

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    if (props.isEdit) {
      // 编辑逻辑
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: title.value,
          description: description.value,
          content: content.value,
        })
        .eq('id', props.initialData.id);
      if (updateError) throw updateError;
      router.push(`/post/${props.initialData.slug}`);
    } else {
      // 创建逻辑
      const { error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            title: title.value,
            description: description.value,
            content: content.value,
            author_id: user.id,
            slug: generateSlug(title.value),
          },
        ]);
      if (insertError) throw insertError;
      router.push('/');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : (props.isEdit ? '更新文章失败' : '发布文章失败');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? '编辑文章' : '创建新文章' }}</h1>

    <div class="mb-4">
      <label class="block mb-2">标题</label>
      <input v-model="title"
        class="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        placeholder="输入文章标题" />
    </div>

    <div class="mb-4">
      <label class="block mb-2">简介</label>
      <textarea v-model="description"
        class="w-full p-2 border rounded min-h-[100px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        placeholder="输入文章简介，将显示在首页"></textarea>
    </div>

    <div class="mb-4">
      <label class="block mb-2">内容</label>
      <div class="mb-2">
        <input type="file" @change="onFileSelected" accept="image/*"
          class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800" />
      </div>
      <textarea ref="textareaRef" v-model="content"
        class="w-full p-2 border rounded min-h-[300px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        placeholder="输入文章内容，支持Markdown格式，可直接粘贴图片"></textarea>
    </div>

    <button @click="handleSubmit" :disabled="isLoading || !title || !content || !description"
      class="text-blue-400 border border-blue-400 rounded px-4 py-2 hover:bg-blue-400 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      {{ isLoading ? (isEdit ? '更新中...' : '发布中...') : (isEdit ? '更新文章' : '发布文章') }}
    </button>

    <p v-if="error" class="text-red-500 dark:text-red-400 mt-2">{{ error }}</p>
  </div>
</template>