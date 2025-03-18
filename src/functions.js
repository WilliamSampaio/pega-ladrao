import CryptoJS from 'crypto-js';


function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Texto copiado para a área de transferência.');
}

function alertMessage(type, message) {
    return {
        'class': type,
        'message': message
    }
}

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function notificationPermissionIsGranted() {
    return Notification.permission === 'granted';
}

async function requestNotificationPermission() {
    if (!notificationPermissionIsGranted()) {
        await Notification.requestPermission()
            .then(permission => {
                if (permission !== 'granted') {
                    console.error('Ops! Você não concedeu permissão de notificação, pode ser que alguns recursos não funcionem adequadamente.');
                }
            });
    }
}

async function requestCameraPermission(videoElement) {
    await navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            videoElement.srcObject = stream;
        })
        .catch((error) => {
            console.error("Error accessing the camera: ", error);
        });
}

function decrypt(text, key) {
    const decrypted = CryptoJS.AES.decrypt(text, key);
    if (!decrypted) return false;
    try {
        let str = decrypted.toString(CryptoJS.enc.Utf8);
        if (str.length > 0) return str;
    } catch (e) {
        return false;
    }
}

export {
    copyToClipboard,
    alertMessage,
    delay,
    notificationPermissionIsGranted,
    requestNotificationPermission,
    requestCameraPermission,
    decrypt
}