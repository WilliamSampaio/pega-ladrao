<template>
    <div v-if="appStore.loading" class="loader-overlay">
        <div class="popup-spinner">
            <div class="spinner" aria-hidden="true"></div>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store';

const appStore = useAppStore();
</script>

<style scoped>
.loader-overlay {
    position: fixed;
    inset: 0;
    z-index: 1109;
    background-color: rgba(0, 0, 0, 0.5);
}

.popup-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    display: grid;
    place-items: center;
    translate: -50% -50%;
}

.spinner {
    width: 80px;
    height: 80px;
    border: 8px solid rgba(255, 255, 255, 0.2);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
