<script setup>
const props = defineProps({
    evidenciasEnviadas: Boolean,
    enviandoEvidencias: Boolean,
    variant: {
        type: String,
        default: 'danger',
    },
});

defineEmits(['registrarEvidencias']);
</script>

<template>
    <div class="evidence-action">
        <p class="evidence-action__text">
            Esta acao pode solicitar permissoes do navegador para registrar evidencias do acesso.
        </p>
        <button
            :disabled="props.evidenciasEnviadas || props.enviandoEvidencias"
            :class="['evidence-action__button', 'evidence-action__button--' + props.variant]"
            @click="$emit('registrarEvidencias')"
        >
            {{
                props.evidenciasEnviadas
                    ? 'EVIDENCIAS REGISTRADAS'
                    : props.enviandoEvidencias
                      ? 'REGISTRANDO...'
                      : 'ABRIR COMPROVANTE'
            }}
        </button>
    </div>
</template>

<style scoped>
.evidence-action {
    display: grid;
    gap: 10px;
    justify-items: center;
}

.evidence-action__text {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
    text-align: center;
}

.evidence-action__button {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 10px 18px;
    font: inherit;
    font-weight: 700;
    line-height: 1.1;
    cursor: pointer;
}

.evidence-action__button:disabled {
    cursor: not-allowed;
    opacity: 0.72;
}

.evidence-action__button--danger {
    color: #ffffff;
    background: #dc3545;
    border-color: #dc3545;
}

.evidence-action__button--success {
    color: #031b07;
    background: #34d399;
    border-color: #16a34a;
}
</style>
