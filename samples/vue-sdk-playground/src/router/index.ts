import { createRouter, createWebHistory } from 'vue-router';
import { createCallbackRoute } from '@asgardeo/vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/OverviewView.vue') },
    { path: '/auth-flows', component: () => import('../views/AuthFlowsView.vue') },
    { path: '/components', redirect: '/components/primitives' },
    {
      path: '/components/:tab',
      component: () => import('../views/ComponentsView.vue'),
    },
    { path: '/public-apis', redirect: '/public-apis/asgardeo' },
    {
      path: '/public-apis/:tab',
      component: () => import('../views/PublicApisView.vue'),
    },
    createCallbackRoute({ path: '/callback' }),
  ],
});

export default router;
