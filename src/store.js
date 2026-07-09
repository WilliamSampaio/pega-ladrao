import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('appStore', () => {
    const loading = ref(false);

    function loadingToggle() {
        if (loading.value) {
            loading.value = false;
        } else {
            loading.value = true;
        }
    }

    return { loading, loadingToggle };
});
