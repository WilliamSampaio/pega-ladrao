import { createRouter, createWebHistory } from 'vue-router'

import NotFound from './views/NotFound.vue';
import GerarView from './views/GerarView.vue'
import ComprovanteFakeView from './views/ComprovanteFakeView.vue';
import AcessosView from './views/AcessosView.vue';

const routes = [
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    { path: '/_gerar', name: 'gerar', component: GerarView },
    { path: '/transacao', name: 'transacao', component: ComprovanteFakeView },
    { path: '/acessos', name: 'acessos', component: AcessosView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;