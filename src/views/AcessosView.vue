<script setup>
import { computed, onBeforeMount, onBeforeUnmount, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, firestore, storage } from '../firebase';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useAppStore } from '../store';
import { copyToClipboard, formataDataHoraPtBr, formataMoedaBRL } from '../functions';
import { ensureAnonymousUser } from '../auth';
import { getDownloadURL, listAll, ref as storageRef } from 'firebase/storage';
import AppAlert from '../components/AppAlert.vue';
import AppButton from '../components/AppButton.vue';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const VITE_DEFAULT_COMPROVANTE_URL = import.meta.env.VITE_DEFAULT_COMPROVANTE_URL;

const data = reactive({
    alert: null,
    comprovante: null,
    acessos: [],
    fotos: {},
    expiracaoContagem: '',
    expirado: false,
});

let countdownTimer = null;
let refreshTimer = null;

const publicLink = computed(() => {
    if (!data.comprovante?.id) {
        return '';
    }

    return VITE_DEFAULT_COMPROVANTE_URL + '/transacao?id=' + data.comprovante.id;
});

const totalAcessos = computed(() => data.acessos.length);

onBeforeMount(() => {
    appStore.loadingToggle();
});

onMounted(async () => {
    if (!route.query.id) {
        appStore.loadingToggle();
        router.push({ path: '/' });
        return;
    }

    try {
        await ensureAnonymousUser();
        const carregado = await carregarPainel(route.query.id);

        if (!carregado) {
            return;
        }

        iniciarContador();
        iniciarAtualizacao();
    } catch (error) {
        data.alert = {
            tone: 'danger',
            title: 'Erro ao carregar acessos.',
            message: 'Verifique autenticacao anonima, regras do Firebase e indices publicados.',
        };
        console.error('Erro ao carregar acessos:', error);
    } finally {
        appStore.loadingToggle();
    }
});

onBeforeUnmount(() => {
    if (countdownTimer) {
        window.clearInterval(countdownTimer);
    }

    if (refreshTimer) {
        window.clearInterval(refreshTimer);
    }
});

async function carregarPainel(comprovanteId) {
    const docRef = doc(firestore, 'comprovantes', comprovanteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        data.alert = {
            tone: 'danger',
            title: 'Comprovante indisponivel.',
            message: 'O comprovante nao existe ou voce nao tem acesso a ele.',
        };
        return false;
    }

    data.comprovante = docSnap.data();
    data.comprovante.id = docSnap.id;

    await atualizarAcessos(comprovanteId);
    return true;
}

async function atualizarAcessos(comprovanteId) {
    data.acessos = [];
    data.fotos = {};

    const acessosQuery = query(
        collection(firestore, 'acessos'),
        where('comprovanteId', '==', comprovanteId),
        where('ownerUid', '==', auth.currentUser.uid),
        orderBy('at', 'desc'),
    );

    const querySnapshot = await getDocs(acessosQuery);
    querySnapshot.forEach((snapshot) => {
        const acesso = { ...snapshot.data() };
        acesso.id = snapshot.id;
        data.acessos.push(acesso);
    });

    await carregarFotos(comprovanteId, data.comprovante.ownerUid);
}

async function carregarFotos(comprovanteId, ownerUid) {
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

function iniciarContador() {
    if (!data.comprovante?.expiracao) {
        return;
    }

    atualizarContador();
    countdownTimer = window.setInterval(atualizarContador, 1000);
}

function atualizarContador() {
    const expiracao = data.comprovante.expiracao.toDate().getTime();
    const now = Date.now();
    const distance = expiracao - now;

    if (distance < 0) {
        data.expirado = true;
        data.expiracaoContagem = 'Comprovante expirado.';

        if (countdownTimer) {
            window.clearInterval(countdownTimer);
            countdownTimer = null;
        }
        return;
    }

    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    data.expirado = false;
    data.expiracaoContagem = 'Comprovante expira em: ' + h + 'h ' + m + 'm ' + s + 's';
}

function iniciarAtualizacao() {
    refreshTimer = window.setInterval(async () => {
        appStore.loadingToggle();

        try {
            await atualizarAcessos(route.query.id);
        } catch (error) {
            data.alert = {
                tone: 'warning',
                title: 'Atualizacao indisponivel.',
                message: 'Nao foi possivel atualizar os acessos agora.',
            };
            console.error('Erro ao atualizar acessos:', error);
        } finally {
            appStore.loadingToggle();
        }
    }, 30 * 1000);
}

function formatarValor(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return 'Nao informado';
    }

    return valor;
}

function formatarTela(acesso) {
    if (!acesso.screenWidth || !acesso.screenHeight) {
        return 'Nao informado';
    }

    return acesso.screenWidth + ' x ' + acesso.screenHeight;
}

function formatarStatusEvidencias(acesso) {
    return acesso.consentimentoEvidencias ? 'acionado pelo visitante' : 'nao acionado';
}

function copiarLinkPublico() {
    if (!publicLink.value) {
        return;
    }

    copyToClipboard(publicLink.value);
}
</script>

<template>
    <section class="access-page" aria-labelledby="access-title">
        <div class="page-heading">
            <p class="page-eyebrow">Acompanhamento</p>
            <h1 id="access-title">Acessos ao comprovante</h1>
            <p>
                Monitore o link publico, acompanhe novos acessos e revise evidencias quando o
                visitante acionar esse registro.
            </p>
        </div>

        <div class="access-page__actions">
            <RouterLink :to="{ name: 'gerar' }" class="app-button app-button--secondary">
                Gerar novo comprovante
            </RouterLink>
        </div>

        <AppAlert v-if="data.alert" :title="data.alert.title" :tone="data.alert.tone" role="alert">
            {{ data.alert.message }}
        </AppAlert>

        <section v-if="data.comprovante" class="section-panel" aria-labelledby="receipt-title">
            <div class="section-heading">
                <p class="page-eyebrow">Resumo do comprovante</p>
                <h2 id="receipt-title">Link publico e estado atual</h2>
            </div>

            <AppAlert v-if="!data.expirado" title="Comprovante gerado com sucesso." tone="success">
                Copie o link publico e acompanhe os acessos abaixo. Evidencias sensiveis so aparecem
                quando o visitante aciona o registro explicito no comprovante.
            </AppAlert>
            <AppAlert v-else title="Comprovante expirado." tone="warning">
                O link publico expirou. Os acessos antigos continuam visiveis enquanto os dados
                ainda estiverem disponiveis.
            </AppAlert>

            <div class="access-summary-grid">
                <div class="access-summary-card">
                    <span class="access-summary-card__label">ID</span>
                    <strong>{{ data.comprovante.id }}</strong>
                </div>
                <div class="access-summary-card">
                    <span class="access-summary-card__label">Instituicao</span>
                    <strong>{{ data.comprovante.instituicao }}</strong>
                </div>
                <div class="access-summary-card">
                    <span class="access-summary-card__label">Valor</span>
                    <strong>{{ formataMoedaBRL(data.comprovante.valor) }}</strong>
                </div>
                <div class="access-summary-card">
                    <span class="access-summary-card__label">Expiracao</span>
                    <strong>{{ data.expiracaoContagem }}</strong>
                </div>
            </div>

            <div class="access-link-box">
                <span class="access-link-box__label">Link publico</span>
                <code>{{ publicLink }}</code>
            </div>

            <div class="form-actions">
                <AppButton type="button" @click="copiarLinkPublico">Copiar link</AppButton>
            </div>
        </section>

        <section class="section-panel" aria-labelledby="access-list-title">
            <div class="section-heading">
                <p class="page-eyebrow">Acessos registrados</p>
                <h2 id="access-list-title">{{ totalAcessos }} acesso(s)</h2>
            </div>

            <AppAlert v-if="!totalAcessos" title="Nenhum acesso ainda." tone="info">
                Assim que alguem abrir o link, ele aparecera aqui. O painel atualiza automaticamente
                a cada 30 segundos.
            </AppAlert>

            <div v-else class="access-list">
                <details
                    v-for="(acesso, index) in data.acessos"
                    :key="acesso.id"
                    class="access-item"
                >
                    <summary class="access-item__summary">
                        <div class="access-item__heading">
                            <strong
                                >{{ index + 1 }}.
                                {{ formataDataHoraPtBr(acesso.at.toDate()) }}</strong
                            >
                            <span v-if="acesso.consentimentoEvidencias" class="access-item__badge">
                                com evidencias
                            </span>
                        </div>
                        <span class="access-item__hint">Ver detalhes</span>
                    </summary>

                    <div class="access-item__body">
                        <div class="access-detail-grid">
                            <section class="access-detail-card">
                                <h3>Resumo</h3>
                                <p><strong>ID:</strong> {{ acesso.id }}</p>
                                <p>
                                    <strong>Data e hora:</strong>
                                    {{ formataDataHoraPtBr(acesso.at.toDate()) }}
                                </p>
                                <p>
                                    <strong>Registro de evidencias:</strong>
                                    {{ formatarStatusEvidencias(acesso) }}
                                </p>
                            </section>

                            <section
                                class="access-detail-card"
                                v-if="acesso.consentimentoEvidencias"
                            >
                                <h3>Rede e navegador</h3>
                                <p>
                                    <strong>IP publico:</strong>
                                    {{ formatarValor(acesso.publicIp) }}
                                </p>
                                <p>
                                    <strong>User agent:</strong>
                                    {{ formatarValor(acesso.userAgent) }}
                                </p>
                                <p><strong>Idioma:</strong> {{ formatarValor(acesso.language) }}</p>
                                <p><strong>Tela:</strong> {{ formatarTela(acesso) }}</p>
                            </section>

                            <section
                                class="access-detail-card"
                                v-if="acesso.consentimentoEvidencias"
                            >
                                <h3>Dispositivo</h3>
                                <p>
                                    <strong>deviceId:</strong> {{ formatarValor(acesso.deviceId) }}
                                </p>
                                <p>
                                    <strong>manufacturer:</strong>
                                    {{ formatarValor(acesso.manufacturer) }}
                                </p>
                                <p><strong>model:</strong> {{ formatarValor(acesso.model) }}</p>
                                <p>
                                    <strong>operatingSystem:</strong>
                                    {{ formatarValor(acesso.operatingSystem) }}
                                </p>
                                <p>
                                    <strong>osVersion:</strong>
                                    {{ formatarValor(acesso.osVersion) }}
                                </p>
                                <p>
                                    <strong>platform:</strong> {{ formatarValor(acesso.platform) }}
                                </p>
                                <p>
                                    <strong>webViewVersion:</strong>
                                    {{ formatarValor(acesso.webViewVersion) }}
                                </p>
                            </section>

                            <section
                                class="access-detail-card"
                                v-if="acesso.consentimentoEvidencias"
                            >
                                <h3>Localizacao</h3>
                                <template v-if="acesso.latitude && acesso.longitude">
                                    <p>
                                        <strong>Precisao:</strong>
                                        {{ formatarValor(acesso.accuracy) }}
                                    </p>
                                    <p><strong>Latitude:</strong> {{ acesso.latitude }}</p>
                                    <p><strong>Longitude:</strong> {{ acesso.longitude }}</p>
                                    <iframe
                                        class="access-map"
                                        :src="
                                            'https://maps.google.com/maps?q=' +
                                            acesso.latitude +
                                            ',' +
                                            acesso.longitude +
                                            '&z=15&output=embed'
                                        "
                                        title="Mapa da localizacao"
                                        loading="lazy"
                                    ></iframe>
                                </template>
                                <p v-else>Localizacao nao disponivel.</p>
                            </section>
                        </div>

                        <section
                            v-if="acesso.consentimentoEvidencias && data.fotos[acesso.id]?.length"
                            class="access-photo-section"
                        >
                            <h3>Fotos</h3>
                            <div class="access-photo-grid">
                                <img
                                    v-for="foto in data.fotos[acesso.id]"
                                    :key="foto"
                                    :src="foto"
                                    class="access-photo"
                                    alt="Evidencia capturada"
                                />
                            </div>
                        </section>
                    </div>
                </details>
            </div>
        </section>
    </section>
</template>
