<template>
    <div class="card mt-3 mb-3">
        <img :src="comprovante.bancoImgSrc" class="w-25 card-img-top mx-auto my-3 d-block" alt="...">
        <div class="card-body">
            <h4 class="card-title text-center"><b>Comprovante de transação Pix</b></h4>
            <hr>
            <h5 class="card-title"><b>Dados do pagador</b></h5>
            <p class="card-text">
                <b>Nome:</b> {{ comprovante.nomePagador }} <br>
                <b>CPF:</b> {{ comprovante.cpfPagador }} <br>
                <b>Instituição:</b> {{ bancoInfo(comprovante.instituicao)?.nome }}
            </p>
            <h5 class="card-title"><b>Dados do pagamento</b></h5>
            <p class="card-text">
                <b>Valor:</b> {{ formataMoedaBRL(comprovante.valor) }} <br>
                <b>Descricao:</b> {{ comprovante.descricao }} <br>
                <b>Id da transação:</b> {{ comprovante.transacao }} <br>
                <b>Data e Hora:</b> {{ comprovante.dataHora }} <br>
                <b>CPF:</b> {{ comprovante.cpfPagador }} <br>
                <b>Tipo de conta:</b> Conta Pagamento <br>
                ...
            </p>
        </div>
        <div class="card-footer text-center">
            <button @click="$emit('tirarFoto')" class="btn btn-danger btn-lg btn-color">ABRIR COMPROVANTE</button>
        </div>
    </div>
</template>

<style scoped>
* {
    font-family: 'Times New Roman', Times, serif;
}

.btn-color {
    font-family: Arial, Helvetica, sans-serif;
    background-color: #00FF00;
    border-color: green;
}

.btn-color:active {
    background-color: black;
}
</style>

<script setup>
import { bancoInfo, formataMoedaBRL } from '../functions';

const props = defineProps({ comprovante: null });
</script>
