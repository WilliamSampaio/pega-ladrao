<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'button',
    },
    variant: {
        type: String,
        default: 'primary',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

defineEmits(['click']);
</script>

<template>
    <button
        :type="props.type"
        :disabled="props.disabled"
        :class="['app-button', 'app-button--' + props.variant]"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </button>
</template>
