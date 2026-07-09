import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

async function ensureAnonymousUser() {
    if (auth.currentUser) {
        return auth.currentUser;
    }

    const credential = await signInAnonymously(auth);
    return credential.user;
}

export { ensureAnonymousUser };
