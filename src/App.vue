<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Loading from './components/Loading.vue';
import shellCss from './style.css?inline';

const THEME_STORAGE_KEY = 'pega-ladrao-theme';
const THEMES = {
    dark: 'dark',
    light: 'light',
};

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

function saveTheme(value) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
        // localStorage can be unavailable in restricted browser contexts.
    }
}

const theme = ref(getStoredTheme() === THEMES.light ? THEMES.light : THEMES.dark);
const route = useRoute();
const shellStylesId = 'app-shell-styles';

const themeLabel = computed(() => (theme.value === THEMES.dark ? 'Tema escuro' : 'Tema claro'));
const nextThemeLabel = computed(() =>
    theme.value === THEMES.dark ? 'Alternar para tema claro' : 'Alternar para tema escuro',
);
const showShell = computed(
    () => route.name !== 'transacao' && window.location.pathname !== '/transacao',
);
const generatorHref = computed(() => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '/';
    }

    return 'https://pegaladrao.app.br/';
});

function removeElementById(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function ensureShellStylesLoaded() {
    removeElementById(shellStylesId);

    const style = document.createElement('style');
    style.id = shellStylesId;
    style.textContent = shellCss;
    document.head.appendChild(style);
}

watch(
    theme,
    (value) => {
        document.documentElement.dataset.theme = value;
        saveTheme(value);
    },
    { immediate: true },
);

watch(
    showShell,
    (enabled) => {
        if (enabled) {
            ensureShellStylesLoaded();
        } else {
            removeElementById(shellStylesId);
        }
    },
    { immediate: true },
);

function toggleTheme() {
    theme.value = theme.value === THEMES.dark ? THEMES.light : THEMES.dark;
}

onBeforeUnmount(() => {
    removeElementById(shellStylesId);
});
</script>

<template>
    <div class="app-shell">
        <header v-if="showShell" class="app-header">
            <a
                class="app-brand"
                :href="generatorHref"
                aria-label="Ir para o gerador de comprovantes"
            >
                <span class="app-brand__mark" aria-hidden="true">PL</span>
                <span class="app-brand__text">Pega Ladrão</span>
            </a>

            <nav class="app-nav" aria-label="Navegacao principal">
                <a class="app-nav__link" :href="generatorHref">Gerar comprovante</a>
                <button
                    class="theme-toggle"
                    type="button"
                    :aria-label="nextThemeLabel"
                    :aria-pressed="theme === THEMES.light"
                    @click="toggleTheme"
                >
                    <span>{{ themeLabel }}</span>
                </button>
            </nav>
        </header>
    </div>

    <main :class="showShell ? 'app-main' : null">
        <RouterView />
    </main>
    <Loading />
</template>

<style scoped></style>
