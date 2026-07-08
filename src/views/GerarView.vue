<template>

    <div class="container mb-3">
        <h1>Gerar Comprovante</h1>
        <hr>
        <div class="alert alert-warning" role="alert">
            <b>Atenção!</b> Use apenas em situações legítimas, respeitando consentimento, privacidade e legislação aplicável. O mau uso deste software é responsabilidade de quem o opera.
        </div>
        <div class="card mb-3">
            <div class="card-body card-text">
                Se você chegou até aqui, provavelmente é porque você é vítima de algum tipo de tentativa de fraude que,
                por meio do seu contato, está tentando extorquir dinheiro de você de alguma forma. Gere um comprovante
                temporário para registrar acessos ao link. O projeto não deve ser usado para coletar dados sensíveis sem
                base legal ou consentimento.
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-body">
                <form @submit.prevent="gerar">
                    <!-- INFO PAGADOR -->
                    <h5 class="card-title">Informações do Pagador</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">O que fez o Pix</h6>
                    <hr>
                    <div class="mb-3">
                        <label for="instituicao" class="form-label">🏦 Instituição</label>
                        <select class="form-select" id="instituicao" v-model="data.instituicao" required>
                            <option selected></option>
                            <option value="bradesco">Bradesco</option>
                            <option value="next">Next</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="nomePagador" class="form-label">🖊️ Nome</label>
                        <input type="text" class="form-control" id="nomePagador" v-model="data.nomePagador"
                            maxlength="100" required>
                    </div>
                    <div class="mb-3">
                        <label for="cpfPagador" class="form-label">🆔 CPF</label>
                        <input type="text" class="form-control mb-2" id="cpfPagador" v-model="data.cpfPagador"
                            v-maska="'###.###.###-##'" required>
                        <div class="alert alert-info" role="alert">
                            Não será exibido na integra, os 3 primeiros dígitos e os 2 últimos serão mascarados<br>
                            Exemplo: ***.748.012-**
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="valor" class="form-label">💲 Valor R$</label>
                        <input type="number" step="0.01" class="form-control" id="valor" v-model="data.valor" required>
                    </div>
                    <div class="mb-3">
                        <label for="descricao" class="form-label">💬 Descrição (opcional)</label>
                        <input type="text" class="form-control" id="descricao" v-model="data.descricao" maxlength="20">
                    </div>
                    <div class="mb-5">
                        <label for="dataHora" class="form-label">🕜 Data/Hora da transação</label>
                        <input type="datetime-local" class="form-control" id="dataHora" v-model="data.dataHora">
                    </div>

                    <!-- INFO PILANTRA -->
                    <h5 class="card-title">Informações do Recebedor</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">O estelionatário que quer o Pix</h6>
                    <hr>
                    <div class="mb-3">
                        <label for="nomePilantra" class="form-label">🖊️ Nome, se souber (opcional)</label>
                        <input type="text" class="form-control" id="nomePilantra" v-model="data.nomePilantra"
                            maxlength="100">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">🆔 CPF ou CNPJ, se souber (opcional)</label>
                        <input type="text" class="form-control mb-2" id="cpfPilantra" v-model="data.cpfPilantra"
                            v-maska="'###.###.###-##'" placeholder="CPF">
                        <input type="text" class="form-control mb-2" id="cnpjPilantra" v-model="data.cnpjPilantra"
                            v-maska="'##.###.###/####-##'" placeholder="CNPJ">
                    </div>
                    <div class="mb-3">
                        <label for="chavePixPilantra" class="form-label">🔑 Chave PIX (opcional)</label>
                        <input type="text" class="form-control" id="chavePixPilantra" v-model="data.chavePixPilantra">
                        <label for="tipoChavePixPilantra" class="form-label">🏷️ Tipo de Chave PIX (opcional)</label>
                        <select class="form-select" id="tipoChavePixPilantra" v-model="data.tipoChavePixPilantra">
                            <option selected></option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="numero">Número de Telefone</option>
                            <option value="email">E-mail</option>
                            <option value="aleatoria">Aleatória</option>
                        </select>
                    </div>
                    <hr>
                    <div class="mb-3">
                        <label for="expiracao" class="form-label">⏱️ Comprovante expira em (minutos)</label>
                        <select class="form-select" id="expiracao" v-model="data.expiracao" required>
                            <option value="10" selected>10min</option>
                            <option value="30">30min</option>
                            <option value="60">60min</option>
                        </select>
                    </div>
                    <div class="mb-3 d-flex justify-content-around">
                        <button type="submit" class="btn btn-primary btn-lg">Gerar 💥</button>
                        <button type="button" @click="limpar" class="btn btn-warning btn-lg">Limpar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { vMaska } from "maska/vue";
import { ref } from 'vue';
import { reactive } from 'vue';
import { useAppStore } from '../store';
import { maskCpf } from "../functions";
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { firestore } from "../firebase";
import { useRouter } from "vue-router";
import { ensureAnonymousUser } from "../auth";

const router = useRouter();

const comprovanteId = ref(null);

const data = reactive({
    instituicao: null,
    nomePagador: '',
    cpfPagador: '',
    valor: 1.99,
    descricao: '',
    dataHora: null,
    nomePilantra: '',
    cpfPilantra: '',
    cnpjPilantra: '',
    chavePixPilantra: '',
    tipoChavePixPilantra: null,
    expiracao: 10
});

const appStore = useAppStore();

async function gerar() {
    appStore.loadingToggle();

    let user;
    try {
        user = await ensureAnonymousUser();
    } catch (error) {
        alert('Erro ao autenticar no Firebase. Verifique se o provedor Anonymous está habilitado.');
        console.error('Erro de autenticação:', error);
        appStore.loadingToggle();
        return;
    }

    const formData = { ...data }

    formData.cpfPagador = maskCpf(formData.cpfPagador);

    if (data.dataHora) {
        formData.dataHora = Timestamp.fromDate(new Date(formData.dataHora));
    } else {
        formData.dataHora = Timestamp.fromDate(new Date());
    }

    const exp = new Date(Date.now() + (formData.expiracao * 60 * 1000));
    formData.expiracao = Timestamp.fromDate(exp);

    formData.nomePagador = formData.nomePagador.toUpperCase().replace(/[^A-Z^' ']+/g, "");

    formData.valor = Number(formData.valor);

    if (!Number.isFinite(formData.valor) || formData.valor <= 0) {
        formData.valor = 0.01
    }

    formData.nomePilantra = formData.nomePilantra.toUpperCase().replace(/[^A-Z^' ']+/g, "");
    formData.ownerUid = user.uid;

    try {
        const ref = doc(collection(firestore, "comprovantes"));
        await setDoc(ref, formData);
        comprovanteId.value = ref.id;
        router.push({ name: 'acessos', query: { id: comprovanteId.value } });
    } catch (error) {
        alert('Erro ao gerar comprovante. Verifique a configuração do Firebase e as regras publicadas.');
        console.error('Erro ao gerar comprovante:', error);
    } finally {
        appStore.loadingToggle();
    }
}

function limpar() {
    comprovanteId.value = null;

    data.instituicao = null;
    data.nomePagador = '';
    data.cpfPagador = '';
    data.valor = 1.99;
    data.descricao = '';
    data.dataHora = null;
    data.nomePilantra = '';
    data.cpfPilantra = '';
    data.cnpjPilantra = '';
    data.chavePixPilantra = '';
    data.tipoChavePixPilantra = null;
    data.expiracao = 10;
}
</script>

<style scoped></style>