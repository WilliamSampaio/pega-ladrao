<script setup>
import { onBeforeMount, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, firestore, storage } from '../firebase';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useAppStore } from '../store';
import { alertMessage, copyToClipboard, formataDataHoraPtBr } from '../functions';
import { ensureAnonymousUser } from '../auth';
import { getDownloadURL, listAll, ref as storageRef } from 'firebase/storage';

const route = useRoute();
const router = useRouter();
const VITE_DEFAULT_COMPROVANTE_URL = import.meta.env.VITE_DEFAULT_COMPROVANTE_URL;
const appStore = useAppStore();

const data = reactive({
    alert: null,
    comprovante: null,
    acessos: [],
    fotos: {},
    expiracaoContagem: '',
    expirado: false,
});

onBeforeMount(() => {
    appStore.loadingToggle();
});

onMounted(async () => {
    if (!route.query.id) {
        router.push({ path: '/' });
        return;
    }

    try {
        await ensureAnonymousUser();

        const docRef = doc(firestore, 'comprovantes', route.query.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            data.alert = alertMessage(
                'danger',
                'Comprovante não existe ou você não tem acesso a ele.',
            );
            appStore.loadingToggle();
            return;
        }

        data.comprovante = docSnap.data();
        data.comprovante.id = docSnap.id;

        await atualizarAcessos(route.query.id);
    } catch (error) {
        data.alert = alertMessage(
            'danger',
            'Erro ao carregar acessos. Verifique autenticação anônima, regras do Firebase e índices publicados.',
        );
        console.error('Erro ao carregar acessos:', error);
        appStore.loadingToggle();
        return;
    }

    const expiracao = data.comprovante.expiracao.toDate().getTime();
    let x = setInterval(() => {
        const now = new Date().getTime();
        let distance = expiracao - now;
        let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((distance % (1000 * 60)) / 1000);

        data.expiracaoContagem = 'Comprovante expira em: ' + h + 'h ' + m + 'm ' + s + 's';

        if (distance < 0) {
            clearInterval(x);
            data.expirado = true;
            data.expiracaoContagem = 'Comprovante expirado!';
        }
    }, 1000);

    appStore.loadingToggle();

    window.setInterval(async () => {
        appStore.loadingToggle();
        try {
            await atualizarAcessos(route.query.id);
        } catch (error) {
            data.alert = alertMessage('warning', 'Não foi possível atualizar os acessos agora.');
            console.error('Erro ao atualizar acessos:', error);
        } finally {
            appStore.loadingToggle();
        }
    }, 30 * 1000);
});

async function atualizarAcessos(comprovanteId) {
    await queryAcessos(comprovanteId);
    await getFotos(comprovanteId, data.comprovante.ownerUid);
}

async function queryAcessos(comprovanteId) {
    data.acessos = [];
    const q = query(
        collection(firestore, 'acessos'),
        where('comprovanteId', '==', comprovanteId),
        where('ownerUid', '==', auth.currentUser.uid),
        orderBy('at', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let acesso = { ...doc.data() };
        acesso.id = doc.id;
        data.acessos.push(acesso);
    });
}

async function getFotos(comprovanteId, ownerUid) {
    data.fotos = {};
    const listRef = storageRef(storage, 'capturas/' + ownerUid + '/' + comprovanteId);

    try {
        const acessos = await listAll(listRef);
        for (const acessoRef of acessos.prefixes) {
            data.fotos[acessoRef.name] = [];
            const fotos = await listAll(acessoRef);
            for (const fotoRef of fotos.items) {
                try {
                    data.fotos[acessoRef.name].push(await getDownloadURL(fotoRef));
                } catch (error) {
                    console.error('Erro ao obter URL da foto:', error);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao listar fotos:', error);
    }
}

function formatarValor(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return 'Não informado';
    }

    return valor;
}
</script>

<template>
    <nav class="navbar mb-3" style="background-color: lightgray">
        <div class="container-fluid">
            <span class="navbar-brand">Pega Ladrão</span>
            <RouterLink :to="{ name: 'gerar' }" class="btn btn-danger"
                >Gerar Novo Comprovante</RouterLink
            >
        </div>
    </nav>

    <div class="container">
        <div
            v-if="data.alert"
            :class="'alert alert-' + data.alert.class + ' alert-dismissible fade show mb-3'"
            role="alert"
        >
            {{ data.alert.message }}
            <button
                @click="data.alert = null"
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
            ></button>
        </div>

        <div
            v-if="data.comprovante && !data.expirado"
            class="alert alert-success text-center"
            role="alert"
        >
            <h4 class="alert-heading" style="font-weight: bold">Comprovante gerado com sucesso!</h4>
            <p>
                <b>ID: {{ data.comprovante?.id }}</b>
            </p>
            <p>
                Copie o link do comprovante e acompanhe os acessos registrados logo abaixo.
                Evidências sensíveis só aparecem quando o visitante aciona o registro explícito no
                comprovante.
            </p>
            <hr />
            <p class="mb-0">
                {{ VITE_DEFAULT_COMPROVANTE_URL }}/transacao?id={{ data.comprovante?.id
                }}<br /><br />
                <button
                    @click="
                        copyToClipboard(
                            VITE_DEFAULT_COMPROVANTE_URL + '/transacao?id=' + data.comprovante.id,
                        )
                    "
                    type="button"
                    class="btn btn-info"
                >
                    Copiar Link
                </button>
            </p>
        </div>

        <h2>Acessos</h2>
        <h3 style="color: red">{{ data.expiracaoContagem }}</h3>
        <hr />
        <div class="accordion" id="accordionFlush">
            <div v-for="(acesso, index) in data.acessos" :key="acesso.id" class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        :data-bs-target="'#item' + index"
                        aria-expanded="false"
                        :aria-controls="'item' + index"
                    >
                        {{ index + 1 }}. {{ formataDataHoraPtBr(acesso.at.toDate()) }}
                        <span
                            v-if="acesso.consentimentoEvidencias"
                            class="badge text-bg-warning ms-2"
                            >com evidências</span
                        >
                    </button>
                </h2>
                <div
                    :id="'item' + index"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionFlush"
                >
                    <div class="accordion-body">
                        <p>
                            <b>ID:</b> {{ acesso.id }} <br />
                            <b>Data e Hora:</b> {{ formataDataHoraPtBr(acesso.at.toDate()) }} <br />
                            <b>Registro de evidências:</b>
                            {{
                                acesso.consentimentoEvidencias
                                    ? 'acionado pelo visitante'
                                    : 'não acionado'
                            }}
                        </p>

                        <template v-if="acesso.consentimentoEvidencias">
                            <h5>Rede e navegador</h5>
                            <hr />
                            <p>
                                <b>IP público:</b> {{ formatarValor(acesso.publicIp) }} <br />
                                <b>User agent:</b> {{ formatarValor(acesso.userAgent) }} <br />
                                <b>Idioma:</b> {{ formatarValor(acesso.language) }} <br />
                                <b>Tela:</b> {{ formatarValor(acesso.screenWidth) }} x
                                {{ formatarValor(acesso.screenHeight) }}
                            </p>

                            <h5>Informações do dispositivo</h5>
                            <hr />
                            <p>
                                <b>deviceId:</b> {{ formatarValor(acesso.deviceId) }} <br />
                                <b>manufacturer:</b> {{ formatarValor(acesso.manufacturer) }} <br />
                                <b>model:</b> {{ formatarValor(acesso.model) }} <br />
                                <b>operatingSystem:</b> {{ formatarValor(acesso.operatingSystem) }}
                                <br />
                                <b>osVersion:</b> {{ formatarValor(acesso.osVersion) }} <br />
                                <b>platform:</b> {{ formatarValor(acesso.platform) }} <br />
                                <b>webViewVersion:</b> {{ formatarValor(acesso.webViewVersion) }}
                            </p>

                            <h5>Localização</h5>
                            <hr />
                            <p v-if="acesso.latitude && acesso.longitude">
                                <b>Precisão:</b> {{ acesso.accuracy }} <br />
                                <b>Latitude:</b> {{ acesso.latitude }} <br />
                                <b>Longitude:</b> {{ acesso.longitude }} <br /><br />
                                <iframe
                                    :src="
                                        'https://maps.google.com/maps?q=' +
                                        acesso.latitude +
                                        ',' +
                                        acesso.longitude +
                                        '&z=15&output=embed'
                                    "
                                    frameborder="1"
                                    style="width: 100%; height: 300px"
                                ></iframe>
                            </p>
                            <div v-else class="alert alert-warning text-center" role="alert">
                                Localização não disponível.
                            </div>

                            <h5 v-if="data.fotos[acesso.id]?.length" class="text-center">Fotos</h5>
                            <div v-if="data.fotos[acesso.id]?.length" class="row g-2">
                                <div
                                    v-for="foto in data.fotos[acesso.id]"
                                    :key="foto"
                                    class="col-12 col-md-6"
                                >
                                    <img
                                        :src="foto"
                                        class="img-fluid rounded"
                                        alt="Evidência capturada"
                                    />
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
