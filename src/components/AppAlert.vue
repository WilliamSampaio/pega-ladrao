<script setup>
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    tone: {
        type: String,
        default: 'info',
    },
    role: {
        type: String,
        default: 'alert',
    },
});
</script>

<template>
    <div :class="['app-alert', 'app-alert--' + props.tone]" :role="props.role">
        <strong v-if="props.title">{{ props.title }}</strong>
        <slot></slot>
    </div>
</template>
