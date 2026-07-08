<template>
    <div class="card mt-3 mb-3">
        <img :src="comprovante.bancoImgSrc" class="w-25 card-img-top mx-auto my-3 d-block" alt="...">
        <div class="card-body">
            <h4 class="card-title text-center">Pix concluído</h4>
            <hr>
            <p class="card-text">
                <b>Data e Hora:</b> {{ comprovante.dataHora }} <br>
                <b>Número de Controle:</b> {{ comprovante.transacao }}
            </p>
            <h5 class="card-title">Dados de quem pagou</h5>
            <p class="card-text">
                <b>Nome:</b> {{ comprovante.nomePagador }} <br>
                <b>CPF:</b> {{ comprovante.cpfPagador }} <br>
                <b>Instituição:</b> {{ bancoInfo(comprovante.instituicao)?.nome }}
            </p>
            <h5 class="card-title">Dados da Transação</h5>
            <p class="card-text">
                <b>Valor:</b> {{ formataMoedaBRL(comprovante.valor) }} <br>
                <b>Data e Hora:</b> {{ comprovante.dataHora }} <br>
                <b>CPF:</b> {{ comprovante.cpfPagador }} <br>
                <b>Debitar da:</b> Conta-Corrente <br>
                ...
            </p>
        </div>
        <div class="card-footer text-center">
            <p class="small text-muted mb-2">
                Esta ação pode solicitar permissões do navegador para registrar evidências do acesso.
            </p>
            <button @click="$emit('registrarEvidencias')" :disabled="evidenciasEnviadas || enviandoEvidencias" class="btn btn-danger btn-lg">
                {{ evidenciasEnviadas ? 'EVIDÊNCIAS REGISTRADAS' : (enviandoEvidencias ? 'REGISTRANDO...' : 'ABRIR COMPROVANTE') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { bancoInfo, formataMoedaBRL } from '../functions';

defineProps({
    comprovante: null,
    evidenciasEnviadas: Boolean,
    enviandoEvidencias: Boolean
});

defineEmits(['registrarEvidencias']);
</script>