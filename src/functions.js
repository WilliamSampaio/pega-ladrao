function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Texto copiado para a área de transferência.');
}

function alertMessage(type, message) {
    return {
        class: type,
        message: message,
    };
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function requestCameraPermission(videoElement) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    return stream;
}

async function getCurrentPosition() {
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        });
    });

    return position.coords.toJSON();
}

function maskCpf(cpf) {
    let splitted = String(cpf).replace('-', '.').split('.');
    return '***.' + splitted[1] + '.' + splitted[2] + '-**';
}

function formataMoedaBRL(valor) {
    return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formataDataHoraPtBr(date, dateStyle = 'short', timeStyle = 'long') {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: dateStyle,
        timeStyle: timeStyle,
    }).format(date);
}

function pegaPrimeiroNome(nome) {
    return String(nome).split(' ')[0];
}

function bancoInfo(key) {
    if (key == 'bradesco') {
        return {
            nome: 'Bradesco S/A',
            nomeResumido: 'Bradesco',
            codigo: 237,
        };
    }

    if (key == 'next') {
        return {
            nome: 'Next (237 - Bradesco S. A.)',
            nomeResumido: 'Next',
            codigo: 237,
        };
    }

    return null;
}

export {
    copyToClipboard,
    alertMessage,
    delay,
    requestCameraPermission,
    getCurrentPosition,
    maskCpf,
    formataMoedaBRL,
    formataDataHoraPtBr,
    pegaPrimeiroNome,
    bancoInfo,
};
