<template>
    <section class="generator-page" aria-labelledby="generator-title">
        <div class="page-heading">
            <p class="page-eyebrow">Gerador de comprovante temporário</p>
            <h1 id="generator-title">Gerar comprovante</h1>
            <p>
                Crie um link temporário para acompanhar acessos e registrar evidências somente
                quando o visitante acionar essa opção.
            </p>
        </div>

        <AppAlert title="Atenção." tone="warning">
            Use apenas em situações legítimas, respeitando consentimento, privacidade e legislação
            aplicável. O mau uso deste software é responsabilidade de quem o opera.
        </AppAlert>

        <section class="section-panel" aria-label="Contexto de uso">
            <p>
                Se você chegou até aqui, provavelmente é porque é vítima de algum tipo de tentativa
                de fraude ou extorsão. O comprovante temporário ajuda a registrar acessos ao link,
                mas o projeto não deve ser usado para coletar dados sensíveis sem base legal ou
                consentimento.
            </p>
            <p class="section-panel__footer">
                Código-fonte e instruções para desenvolvedores:
                <a
                    href="https://github.com/WilliamSampaio/pega-ladrao"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    github.com/WilliamSampaio/pega-ladrao
                </a>
            </p>
        </section>

        <AppAlert v-if="data.feedback" :title="data.feedback.title" :tone="data.feedback.type">
            {{ data.feedback.message }}
        </AppAlert>

        <form class="generator-form" @submit.prevent="gerar">
            <section class="section-panel" aria-labelledby="payer-title">
                <div class="section-heading">
                    <p class="page-eyebrow">Dados do pagador</p>
                    <h2 id="payer-title">Informações de quem fez o Pix</h2>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <label for="instituicao">Instituição</label>
                        <select id="instituicao" v-model="data.instituicao" required>
                            <option selected></option>
                            <option value="bradesco">Bradesco</option>
                            <option value="next">Next</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="nomePagador">Nome</label>
                        <input
                            id="nomePagador"
                            v-model="data.nomePagador"
                            type="text"
                            maxlength="100"
                            autocomplete="name"
                            required
                        />
                    </div>

                    <div class="form-field">
                        <label for="cpfPagador">CPF</label>
                        <input
                            id="cpfPagador"
                            v-model="data.cpfPagador"
                            type="text"
                            v-maska="'###.###.###-##'"
                            inputmode="numeric"
                            required
                        />
                        <p class="field-help">
                            O CPF não será exibido na íntegra. Exemplo: ***.748.012-**.
                        </p>
                    </div>

                    <div class="form-field form-field--currency">
                        <label for="valor">Valor R$</label>
                        <input
                            id="valor"
                            v-model="data.valor"
                            type="number"
                            step="0.01"
                            min="0.01"
                            inputmode="decimal"
                            required
                        />
                    </div>

                    <div class="form-field">
                        <label for="descricao">Descrição opcional</label>
                        <input id="descricao" v-model="data.descricao" type="text" maxlength="20" />
                    </div>

                    <div class="form-field">
                        <label for="dataHora">Data e hora da transação</label>
                        <input id="dataHora" v-model="data.dataHora" type="datetime-local" />
                    </div>
                </div>
            </section>

            <section class="section-panel" aria-labelledby="receiver-title">
                <div class="section-heading">
                    <p class="page-eyebrow">Dados do recebedor</p>
                    <h2 id="receiver-title">Informações de quem quer receber o Pix</h2>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <label for="nomePilantra">Nome, se souber</label>
                        <input
                            id="nomePilantra"
                            v-model="data.nomePilantra"
                            type="text"
                            maxlength="100"
                        />
                    </div>

                    <div class="form-field">
                        <label for="cpfPilantra">CPF, se souber</label>
                        <input
                            id="cpfPilantra"
                            v-model="data.cpfPilantra"
                            type="text"
                            v-maska="'###.###.###-##'"
                            inputmode="numeric"
                        />
                    </div>

                    <div class="form-field">
                        <label for="cnpjPilantra">CNPJ, se souber</label>
                        <input
                            id="cnpjPilantra"
                            v-model="data.cnpjPilantra"
                            type="text"
                            v-maska="'##.###.###/####-##'"
                            inputmode="numeric"
                        />
                    </div>

                    <div class="form-field">
                        <label for="chavePixPilantra">Chave Pix opcional</label>
                        <input id="chavePixPilantra" v-model="data.chavePixPilantra" type="text" />
                    </div>

                    <div class="form-field">
                        <label for="tipoChavePixPilantra">Tipo de chave Pix opcional</label>
                        <select id="tipoChavePixPilantra" v-model="data.tipoChavePixPilantra">
                            <option selected></option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="numero">Número de telefone</option>
                            <option value="email">E-mail</option>
                            <option value="aleatoria">Aleatória</option>
                        </select>
                    </div>
                </div>
            </section>

            <section class="section-panel" aria-labelledby="expiration-title">
                <div class="section-heading">
                    <p class="page-eyebrow">Validade</p>
                    <h2 id="expiration-title">Tempo de expiração</h2>
                </div>

                <div class="form-field">
                    <label for="expiracao">Comprovante expira em</label>
                    <select id="expiracao" v-model="data.expiracao" required>
                        <option value="10" selected>10 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="60">60 minutos</option>
                    </select>
                </div>
            </section>

            <div class="form-actions">
                <AppButton type="submit">Gerar comprovante</AppButton>
                <AppButton type="button" variant="secondary" @click="limpar">Limpar</AppButton>
            </div>
        </form>
    </section>
</template>

<script setup>
import { vMaska } from 'maska/vue';
import { ref } from 'vue';
import { reactive } from 'vue';
import AppAlert from '../components/AppAlert.vue';
import AppButton from '../components/AppButton.vue';
import { useAppStore } from '../store';
import { maskCpf } from '../functions';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useRouter } from 'vue-router';
import { ensureAnonymousUser } from '../auth';

const router = useRouter();

const comprovanteId = ref(null);

const data = reactive({
    feedback: null,
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
    expiracao: 10,
});

const appStore = useAppStore();

async function gerar() {
    appStore.loadingToggle();
    data.feedback = null;

    let user;
    try {
        user = await ensureAnonymousUser();
    } catch (error) {
        data.feedback = {
            type: 'danger',
            title: 'Erro de autenticação.',
            message: 'Verifique se o provedor Anonymous está habilitado no Firebase.',
        };
        console.error('Erro de autenticação:', error);
        appStore.loadingToggle();
        return;
    }

    const formData = { ...data };
    delete formData.feedback;

    formData.cpfPagador = maskCpf(formData.cpfPagador);

    if (data.dataHora) {
        formData.dataHora = Timestamp.fromDate(new Date(formData.dataHora));
    } else {
        formData.dataHora = Timestamp.fromDate(new Date());
    }

    const exp = new Date(Date.now() + formData.expiracao * 60 * 1000);
    formData.expiracao = Timestamp.fromDate(exp);

    formData.nomePagador = formData.nomePagador.toUpperCase().replace(/[^A-Z^' ']+/g, '');

    formData.valor = Number(formData.valor);

    if (!Number.isFinite(formData.valor) || formData.valor <= 0) {
        formData.valor = 0.01;
    }

    formData.nomePilantra = formData.nomePilantra.toUpperCase().replace(/[^A-Z^' ']+/g, '');
    formData.ownerUid = user.uid;

    try {
        const ref = doc(collection(firestore, 'comprovantes'));
        await setDoc(ref, formData);
        comprovanteId.value = ref.id;
        router.push({ name: 'acessos', query: { id: comprovanteId.value } });
    } catch (error) {
        data.feedback = {
            type: 'danger',
            title: 'Erro ao gerar comprovante.',
            message: 'Verifique a configuração do Firebase e as regras publicadas.',
        };
        console.error('Erro ao gerar comprovante:', error);
    } finally {
        appStore.loadingToggle();
    }
}

function limpar() {
    comprovanteId.value = null;

    data.feedback = null;
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
