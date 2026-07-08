import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { cleanupExpiredData } from './src/cleanup.js';

initializeApp();

const DEFAULT_BATCH_SIZE = 100;

export { cleanupExpiredData } from './src/cleanup.js';

export const limparDadosExpirados = onSchedule({
    schedule: 'every day 03:00',
    timeZone: 'America/Manaus',
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 540,
}, async () => {
    const batchSize = Number.parseInt(process.env.CLEANUP_BATCH_SIZE || DEFAULT_BATCH_SIZE.toString(), 10);

    return cleanupExpiredData({
        db: getFirestore(),
        bucket: getStorage().bucket(),
        now: Timestamp.now(),
        batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : DEFAULT_BATCH_SIZE,
        logger,
    });
});
