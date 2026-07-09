const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_ACCESS_BATCH_SIZE = 450;

export async function cleanupExpiredData({
    db,
    bucket,
    now = new Date(),
    batchSize = DEFAULT_BATCH_SIZE,
    accessBatchSize = DEFAULT_ACCESS_BATCH_SIZE,
    logger = console,
} = {}) {
    if (!db) {
        throw new Error('cleanupExpiredData requires a Firestore instance.');
    }

    if (!bucket) {
        throw new Error('cleanupExpiredData requires a Storage bucket.');
    }

    const result = {
        comprovantesEncontrados: 0,
        comprovantesRemovidos: 0,
        comprovantesIgnorados: 0,
        acessosRemovidos: 0,
        arquivosRemovidos: 0,
        erros: [],
    };

    const snapshot = await db
        .collection('comprovantes')
        .where('expiracao', '<=', now)
        .orderBy('expiracao', 'asc')
        .limit(batchSize)
        .get();

    result.comprovantesEncontrados = snapshot.size ?? snapshot.docs.length;
    logInfo(logger, 'Iniciando limpeza de dados expirados.', {
        comprovantesEncontrados: result.comprovantesEncontrados,
        batchSize,
    });

    for (const comprovanteDoc of snapshot.docs) {
        const comprovanteId = comprovanteDoc.id;
        const comprovante = comprovanteDoc.data() || {};

        try {
            const arquivosRemovidos = await deleteCapturas({
                bucket,
                ownerUid: comprovante.ownerUid,
                comprovanteId,
                logger,
            });

            const acessosRemovidos = await deleteAcessos({
                db,
                comprovanteId,
                accessBatchSize,
            });

            await comprovanteDoc.ref.delete();

            result.arquivosRemovidos += arquivosRemovidos;
            result.acessosRemovidos += acessosRemovidos;
            result.comprovantesRemovidos += 1;

            logInfo(logger, 'Comprovante expirado removido.', {
                comprovanteId,
                ownerUid: comprovante.ownerUid || null,
                acessosRemovidos,
                arquivosRemovidos,
            });
        } catch (error) {
            result.comprovantesIgnorados += 1;
            result.erros.push({
                comprovanteId,
                message: error.message,
            });
            logError(logger, 'Falha ao limpar comprovante expirado.', {
                comprovanteId,
                ownerUid: comprovante.ownerUid || null,
                error,
            });
        }
    }

    logInfo(logger, 'Limpeza de dados expirados concluida.', result);
    return result;
}

async function deleteCapturas({ bucket, ownerUid, comprovanteId, logger }) {
    if (!ownerUid) {
        logError(logger, 'Comprovante expirado sem ownerUid; capturas nao podem ser localizadas.', {
            comprovanteId,
        });
        return 0;
    }

    const prefix = `capturas/${ownerUid}/${comprovanteId}/`;
    const [files] = await bucket.getFiles({ prefix });
    let removed = 0;

    for (const file of files) {
        try {
            await file.delete({ ignoreNotFound: true });
            removed += 1;
        } catch (error) {
            if (isNotFoundError(error)) {
                continue;
            }

            throw error;
        }
    }

    return removed;
}

async function deleteAcessos({ db, comprovanteId, accessBatchSize }) {
    const snapshot = await db
        .collection('acessos')
        .where('comprovanteId', '==', comprovanteId)
        .get();

    let removed = 0;

    for (let index = 0; index < snapshot.docs.length; index += accessBatchSize) {
        const docs = snapshot.docs.slice(index, index + accessBatchSize);
        const batch = db.batch();

        for (const acessoDoc of docs) {
            batch.delete(acessoDoc.ref);
        }

        await batch.commit();
        removed += docs.length;
    }

    return removed;
}

function isNotFoundError(error) {
    return (
        error?.code === 404 ||
        error?.code === 'ENOENT' ||
        error?.code === 'storage/object-not-found' ||
        error?.message?.toLowerCase().includes('not found')
    );
}

function logInfo(logger, message, payload) {
    if (typeof logger.info === 'function') {
        logger.info(message, payload);
        return;
    }

    logger.log(message, payload);
}

function logError(logger, message, payload) {
    if (typeof logger.error === 'function') {
        logger.error(message, payload);
        return;
    }

    logger.log(message, payload);
}
