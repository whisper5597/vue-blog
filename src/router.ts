import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './lib/supabase'; // 从 supabase.ts 导入 supabase 实例
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import CreatePost from './views/CreatePost.vue'; // 导入新的视图
import PostDetail from './views/PostDetail.vue';
import EditPost from './views/EditPost.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
      path: '/create',
      component: CreatePost, // 将组件更改为 CreatePost 视图
      meta: { requiresAuth: true }
    },
    {
      path: '/posts/:id',
      component: PostDetail,
      name: 'PostDetail'
    },
    // 新增编辑路由
    {
      path: '/posts/:id/edit',
      component: EditPost,
      name: 'EditPost',
      meta: { requiresAuth: true }
    }
  ]
});

// 路由守卫
router.beforeEach(async (to, _, next) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;