import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据概览' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/list.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/views/user/detail.vue'),
        meta: { title: '用户详情' },
      },
      {
        path: 'pets',
        name: 'Pets',
        component: () => import('@/views/pet/list.vue'),
        meta: { title: '宠物内容风控' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/detail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'deposits',
        name: 'Deposits',
        component: () => import('@/views/deposit/list.vue'),
        meta: { title: '押金管理' },
      },
      {
        path: 'disputes',
        name: 'Disputes',
        component: () => import('@/views/dispute/list.vue'),
        meta: { title: '售后仲裁' },
      },
      {
        path: 'feedbacks',
        name: 'Feedbacks',
        component: () => import('@/views/feedback/list.vue'),
        meta: { title: '用户反馈' },
      },
      {
        path: 'warnings',
        name: 'Warnings',
        component: () => import('@/views/warning/list.vue'),
        meta: { title: '预警管理' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/setting/index.vue'),
        meta: { title: '平台配置' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
});

// Auth guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token');
  if (to.name !== 'Login' && !token) {
    next('/login');
  } else if (to.name === 'Login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
