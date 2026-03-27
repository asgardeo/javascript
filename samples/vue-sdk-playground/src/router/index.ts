import { createRouter, createWebHistory } from 'vue-router';
import { createCallbackRoute } from '@asgardeo/vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/OverviewView.vue') },
    { path: '/auth-flows', component: () => import('../views/AuthFlowsView.vue') },
    { path: '/components', component: () => import('../views/ComponentsView.vue') },
    { path: '/public-apis', component: () => import('../views/PublicApisView.vue') },
    createCallbackRoute({ path: '/callback' }),
  ],
});

export default router;
