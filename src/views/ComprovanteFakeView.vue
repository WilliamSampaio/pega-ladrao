<script setup>
import { computed, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { firestore, storage } from '../firebase';
import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadString } from 'firebase/storage';
import { useAppStore } from '../store';
import {
    bancoInfo,
    delay,
    formataDataHoraPtBr,
    formataMoedaBRL,
    getCurrentPosition,
    maskCpf,
    pegaPrimeiroNome,
    requestCameraPermission,
} from '../functions';
import Bradesco from '../components/ComprovanteBradesco.vue';
import Next from '../components/ComprovanteNext.vue';
import { Device } from '@capacitor/device';

const route = useRoute();
const router = useRouter();

const appStore = useAppStore();

const comprovante = ref(null);
const video = ref(null);
const canvas = ref(null);

const data = reactive({
    erro: null,
    evidenciasEnviadas: false,
    enviandoEvidencias: false,
});

onBeforeMount(() => {
    appStore.loadingToggle();
});

onMounted(() => {
    document.documentElement.classList.add('public-receipt-mode');
    document.body.classList.add('public-receipt-mode');
});

onBeforeUnmount(() => {
    document.documentElement.classList.remove('public-receipt-mode');
    document.body.classList.remove('public-receipt-mode');
});

onMounted(async () => {
    try {
        if (!route.query.id) {
            router.push({ path: '/' });
            return;
        }

        const docRef = doc(firestore, 'comprovantes', route.query.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().expiracao.toDate() < new Date()) {
            router.push({ path: '/' });
            return;
        }

        comprovante.value = docSnap.data();
        comprovante.value.dataHora = formataDataHoraPtBr(comprovante.value.dataHora.toDate());
        comprovante.value.bancoImgSrc = bancoImgSrc.value;
        comprovante.value.transacao = route.query.id;

        if (!bancoInfo(comprovante.value.instituicao)) {
            router.push({ path: '/' });
            return;
        }

        setMetaData();
        await registrarAcessoBasico();
    } catch (error) {
        data.erro = 'Não foi possível carregar o comprovante.';
        console.error('Erro ao carregar comprovante:', error);
    } finally {
        appStore.loadingToggle();
    }
});

const bancoImgSrc = computed(() => {
    return '/assets/bancos/' + comprovante.value.instituicao + '.jpg';
});

const faviconSrc = computed(() => {
    return '/assets/bancos/' + comprovante.value.instituicao + '-favicon.png';
});

async function registrarAcessoBasico() {
    try {
        const acessoRef = doc(collection(firestore, 'acessos'));
        await setDoc(acessoRef, {
            at: serverTimestamp(),
            comprovanteId: comprovante.value.transacao,
            ownerUid: comprovante.value.ownerUid,
            consentimentoEvidencias: false,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.screen?.width || null,
            screenHeight: window.screen?.height || null,
        });
    } catch (error) {
        data.erro = 'Comprovante carregado, mas não foi possível registrar o acesso.';
        console.error('Erro ao registrar acesso:', error);
    }
}

async function registrarEvidencias() {
    const autorizado = window.confirm(
        'Para registrar evidências, este site solicitará permissões do navegador e poderá coletar IP público, informações do dispositivo, localização aproximada e uma imagem da câmera. Deseja continuar?',
    );

    if (!autorizado) {
        return;
    }

    data.erro = null;
    data.enviandoEvidencias = true;

    const evidencias = {
        at: serverTimestamp(),
        comprovanteId: comprovante.value.transacao,
        ownerUid: comprovante.value.ownerUid,
        consentimentoEvidencias: true,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null,
        fotoCapturada: false,
    };

    try {
        try {
            const deviceInfo = await Device.getInfo();
            const deviceId = await Device.getId();
            Object.assign(evidencias, deviceInfo, { deviceId: deviceId.identifier });
        } catch (error) {
            console.error('Erro ao obter informações do dispositivo:', error);
        }

        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const json = await response.json();
            evidencias.publicIp = json.ip;
        } catch (error) {
            console.error('Erro ao obter IP público:', error);
        }

        try {
            Object.assign(evidencias, await getCurrentPosition());
        } catch (error) {
            console.error('Erro ao obter localização:', error);
        }

        const acessoRef = doc(collection(firestore, 'acessos'));

        try {
            await capturarFoto(acessoRef.id);
            evidencias.fotoCapturada = true;
        } catch (error) {
            console.error('Erro ao capturar foto:', error);
        }

        Object.keys(evidencias).forEach(
            (key) => evidencias[key] === undefined && delete evidencias[key],
        );
        await setDoc(acessoRef, evidencias);
        data.evidenciasEnviadas = true;
    } catch (error) {
        data.erro = 'Não foi possível registrar as evidências.';
        console.error('Erro ao registrar evidências:', error);
    } finally {
        pararCamera();
        data.enviandoEvidencias = false;
    }
}

async function capturarFoto(acessoId) {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera indisponível neste navegador.');
    }

    await requestCameraPermission(video.value);
    video.value.play();
    await delay(500);

    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;

    const context = canvas.value.getContext('2d');
    context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);

    const path =
        'capturas/' +
        comprovante.value.ownerUid +
        '/' +
        comprovante.value.transacao +
        '/' +
        acessoId +
        '/' +
        Date.now().toString() +
        '.jpg';
    await uploadString(
        storageRef(storage, path),
        canvas.value.toDataURL('image/jpeg', 0.85),
        'data_url',
    );
}

function pararCamera() {
    const tracks = video.value?.srcObject?.getTracks?.();
    if (tracks) {
        tracks.forEach((t) => t.stop());
    }
}

function setMetaData() {
    const banco = bancoInfo(comprovante.value.instituicao);

    document.title =
        banco.nomeResumido +
        ' - Pix ' +
        formataMoedaBRL(comprovante.value.valor) +
        ' de ' +
        pegaPrimeiroNome(comprovante.value.nomePagador);

    let docRecebedor = '';
    let nomeRecebedor = '';

    if (comprovante.value.cpfPilantra) {
        docRecebedor = maskCpf(comprovante.value.cpfPilantra);
    } else if (comprovante.value.cnpjPilantra) {
        docRecebedor = comprovante.value.cnpjPilantra;
    }

    if (comprovante.value.nomePilantra) {
        nomeRecebedor += pegaPrimeiroNome(comprovante.value.nomePilantra);
    }

    let para = '';

    if (docRecebedor && nomeRecebedor) {
        para += ' para ' + docRecebedor + ' - ' + nomeRecebedor;
    } else if (docRecebedor || nomeRecebedor) {
        para += ' para ' + docRecebedor + nomeRecebedor;
    }

    document
        .getElementsByTagName('meta')
        .namedItem('description')
        .setAttribute(
            'content',
            'Comprovante ' +
                banco.nome +
                ': Transação no valor de ' +
                formataMoedaBRL(comprovante.value.valor) +
                para +
                '.',
        );

    document.querySelector('link[rel="icon"]').href = faviconSrc.value;
}
</script>

<template>
    <div class="container">
        <Bradesco
            v-if="comprovante && comprovante.instituicao == 'bradesco'"
            :comprovante="comprovante"
            :evidencias-enviadas="data.evidenciasEnviadas"
            :enviando-evidencias="data.enviandoEvidencias"
            @registrar-evidencias="registrarEvidencias"
        />
        <Next
            v-if="comprovante && comprovante.instituicao == 'next'"
            :comprovante="comprovante"
            :evidencias-enviadas="data.evidenciasEnviadas"
            :enviando-evidencias="data.enviandoEvidencias"
            @registrar-evidencias="registrarEvidencias"
        />

        <div v-if="data.erro" class="alert alert-warning mt-3" role="alert">
            {{ data.erro }}
        </div>
    </div>
    <video ref="video" muted autoplay playsinline></video>
    <canvas ref="canvas"></canvas>
</template>

<style scoped>
:global(html.public-receipt-mode),
:global(body.public-receipt-mode) {
    min-width: 320px;
    min-height: 100%;
    margin: 0;
    background: #ffffff;
    color: #1f2937;
    font-family: Arial, Helvetica, sans-serif;
}

:global(body.public-receipt-mode *) {
    box-sizing: border-box;
}

.container {
    width: min(100% - 24px, 1048px);
    margin: 0 auto;
    padding-block: 40px;
}

:deep(.card) {
    overflow: hidden;
    border: 1px solid #d7d7d7;
    border-radius: 6px;
    background: #ffffff;
    color: #334155;
}

:deep(.mt-3) {
    margin-top: 1rem;
}

:deep(.mb-3) {
    margin-bottom: 1rem;
}

:deep(.card-img-top) {
    display: block;
}

:deep(.w-25) {
    width: min(25%, 240px);
}

:deep(.mx-auto) {
    margin-inline: auto;
}

:deep(.my-3) {
    margin-block: 1rem;
}

:deep(.d-block) {
    display: block;
}

:deep(.card-body) {
    padding: 16px;
}

:deep(.card-title) {
    margin-block: 0 12px;
    color: #334155;
}

:deep(.text-center) {
    text-align: center;
}

:deep(.card-text) {
    margin-block: 0 18px;
    color: #475569;
}

:deep(.card-footer) {
    border-top: 1px solid #d7d7d7;
    padding: 12px 16px;
    background: #f8f8f8;
}

:deep(.small) {
    font-size: 0.875rem;
}

:deep(.text-muted) {
    color: #64748b;
}

:deep(.mb-2) {
    margin-bottom: 0.5rem;
}

:deep(.btn) {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 9px 16px;
    font: inherit;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: none;
    cursor: pointer;
}

:deep(.btn:disabled) {
    cursor: not-allowed;
    opacity: 0.7;
}

:deep(.btn-danger) {
    color: #ffffff;
    background: #dc3545;
    border-color: #dc3545;
}

:deep(.btn-lg) {
    min-height: 48px;
    padding-inline: 18px;
    font-size: 1.05rem;
}

:deep(.alert) {
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 12px 16px;
    color: #78350f;
    background: #fffbeb;
}

:deep(.alert-warning) {
    border-color: #f59e0b;
}

video,
canvas {
    display: none;
}

@media (max-width: 640px) {
    .container {
        width: min(100% - 16px, 1048px);
        padding-block: 12px;
    }

    :deep(.w-25) {
        width: min(54%, 220px);
    }
}
</style>
