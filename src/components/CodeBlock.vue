<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { createHighlighter, type Highlighter } from 'shiki';

const props = defineProps<{ code: string; lang: string }>();
const highlightedCode = ref('');
let highlighter: Highlighter | null = null;
const currentTheme = ref('vitesse-dark');

const getThemeName = (): string => {
  return document.documentElement.classList.contains('dark') ? 'vitesse-dark' : 'vitesse-light';
};

const highlight = async () => {
  if (!highlighter) {
    try {
      highlighter = await createHighlighter({
        themes: ['vitesse-dark', 'vitesse-light'], // 同时加载亮色和暗色主题
        langs: ['javascript', 'typescript', 'vue', 'html', 'css', 'bash', 'json'],
      });
    } catch (err) {
      console.error('Shiki 初始化失败:', err);
      // 降级处理，显示无高亮的原始代码
      highlightedCode.value = `<pre><code>${props.code}</code></pre>`;
      return;
    }
  }
  if (props.code) {
    highlightedCode.value = highlighter.codeToHtml(props.code, {
      lang: props.lang,
      // 直接使用 currentTheme.value，移除不正确的类型断言
      theme: currentTheme.value,
    });
  }
};

let observer: MutationObserver | null = null;

onMounted(() => {
  currentTheme.value = getThemeName();
  highlight();

  // 监听 <html> 元素 class 的变化来切换主题
  observer = new MutationObserver(() => {
    const newTheme = getThemeName();
    if (newTheme !== currentTheme.value) {
      currentTheme.value = newTheme;
      highlight(); // 主题变化时重新高亮代码
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => {
  // 组件卸载时停止监听
  if (observer) {
    observer.disconnect();
  }
});

watch(
  () => [props.code, props.lang],
  () => {
    highlight();
  }
);
</script>

<template>
  <div class="code-block relative group">
    <div v-if="highlightedCode" v-html="highlightedCode"></div>
    <div v-else class="whitespace-pre-wrap">{{ code }}</div>
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="text-xs opacity-70">Shiki</span>
    </div>
  </div>
</template>

<style scoped>
.code-block :deep(pre) {
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>