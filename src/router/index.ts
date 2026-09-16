import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/index.vue')
    },
    {
      path: '/search',
      component: () => import('@/pages/search.vue')
    },
    {
      path: '/bookmarks',
      component: () => import('@/pages/bookmarks.vue')
    },
    {
      path: '/sync',
      component: () => import('@/pages/sync.vue')
    },
    {
      path: '/links',
      component: () => import('@/pages/links.vue')
    },
    {
      path: '/repos',
      component: () => import('@/pages/repos.vue')
    },
    {
      path: '/stars',
      component: () => import('@/pages/stars.vue')
    },
    {
      path: '/custom',
      component: () => import('@/pages/custom.vue')
    },
    {
      path: '/category/:id',
      component: () => import('@/pages/category/[id].vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})
