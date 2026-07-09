import { createRouter, createWebHistory } from 'vue-router';

import NotFound from './views/NotFound.vue';
import GerarView from './views/GerarView.vue';
import ComprovanteFakeView from './views/ComprovanteFakeView.vue';
import AcessosView from './views/AcessosView.vue';

const GERADOR_HOSTS = [
    'pegaladrao.app.br',
    'pega-ladrao-d9d04.web.app',
    'pega-ladrao-d9d04.firebaseapp.com',
    'localhost',
    '127.0.0.1',
];

const COMPROVANTE_HOSTS = [
    'comprovante-br-gov-bcb-pix-cdba8.web.app',
    'comprovante-br-gov-bcb-pix-cdba8.firebaseapp.com',
];

const getHostType = () => {
    const hostname = window.location.hostname;

    if (GERADOR_HOSTS.includes(hostname)) {
        return 'gerador';
    }

    if (COMPROVANTE_HOSTS.includes(hostname)) {
        return 'comprovante';
    }

    return 'desconhecido';
};

const routes = [
    {
        path: '/',
        name: 'home',
        component: GerarView,
        meta: {
            allowedHosts: ['gerador'],
        },
    },

    {
        path: '/_gerar',
        name: 'gerar',
        redirect: '/',
        meta: {
            allowedHosts: ['gerador'],
        },
    },

    {
        path: '/transacao',
        name: 'transacao',
        component: ComprovanteFakeView,
        meta: {
            allowedHosts: ['comprovante'],
            requiresId: true,
        },
    },

    {
        path: '/acessos',
        name: 'acessos',
        component: AcessosView,
        meta: {
            allowedHosts: ['gerador'],
        },
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const hostType = getHostType();

    const allowedHosts = to.meta.allowedHosts;

    if (allowedHosts && !allowedHosts.includes(hostType)) {
        return {
            name: 'NotFound',
        };
    }

    if (to.meta.requiresId && !to.query.id) {
        return {
            name: 'NotFound',
        };
    }

    return true;
});

export default router;
