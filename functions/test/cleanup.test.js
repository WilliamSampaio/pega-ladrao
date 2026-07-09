import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanupExpiredData } from '../src/cleanup.js';

test('remove comprovante expirado, acessos e capturas associadas', async () => {
    const now = new Date('2026-07-08T12:00:00.000Z');
    const db = new FakeFirestore({
        comprovantes: {
            expirado: {
                expiracao: new Date('2026-07-08T11:59:00.000Z'),
                ownerUid: 'owner-uid',
            },
        },
        acessos: {
            acesso1: {
                comprovanteId: 'expirado',
                ownerUid: 'owner-uid',
            },
            acesso2: {
                comprovanteId: 'expirado',
                ownerUid: 'owner-uid',
            },
        },
    });
    const bucket = new FakeBucket([
        'capturas/owner-uid/expirado/acesso1/photo.jpg',
        'capturas/owner-uid/expirado/acesso2/photo.jpg',
    ]);

    const result = await cleanupExpiredData({ db, bucket, now, logger: silentLogger });

    assert.equal(result.comprovantesEncontrados, 1);
    assert.equal(result.comprovantesRemovidos, 1);
    assert.equal(result.acessosRemovidos, 2);
    assert.equal(result.arquivosRemovidos, 2);
    assert.equal(db.hasDoc('comprovantes', 'expirado'), false);
    assert.equal(db.hasDoc('acessos', 'acesso1'), false);
    assert.equal(db.hasDoc('acessos', 'acesso2'), false);
    assert.equal(bucket.hasFile('capturas/owner-uid/expirado/acesso1/photo.jpg'), false);
    assert.equal(bucket.hasFile('capturas/owner-uid/expirado/acesso2/photo.jpg'), false);
});

test('mantem comprovante nao expirado com seus acessos e capturas', async () => {
    const now = new Date('2026-07-08T12:00:00.000Z');
    const db = new FakeFirestore({
        comprovantes: {
            valido: {
                expiracao: new Date('2026-07-08T12:01:00.000Z'),
                ownerUid: 'owner-uid',
            },
        },
        acessos: {
            acesso1: {
                comprovanteId: 'valido',
                ownerUid: 'owner-uid',
            },
        },
    });
    const bucket = new FakeBucket(['capturas/owner-uid/valido/acesso1/photo.jpg']);

    const result = await cleanupExpiredData({ db, bucket, now, logger: silentLogger });

    assert.equal(result.comprovantesEncontrados, 0);
    assert.equal(result.comprovantesRemovidos, 0);
    assert.equal(db.hasDoc('comprovantes', 'valido'), true);
    assert.equal(db.hasDoc('acessos', 'acesso1'), true);
    assert.equal(bucket.hasFile('capturas/owner-uid/valido/acesso1/photo.jpg'), true);
});

test('reexecucao ignora dados ja removidos parcialmente', async () => {
    const now = new Date('2026-07-08T12:00:00.000Z');
    const db = new FakeFirestore({
        comprovantes: {
            expirado: {
                expiracao: new Date('2026-07-08T11:59:00.000Z'),
                ownerUid: 'owner-uid',
            },
        },
        acessos: {},
    });
    const bucket = new FakeBucket(['capturas/owner-uid/expirado/acesso1/photo.jpg'], {
        deleteAsNotFound: new Set(['capturas/owner-uid/expirado/acesso1/photo.jpg']),
    });

    const result = await cleanupExpiredData({ db, bucket, now, logger: silentLogger });
    const rerun = await cleanupExpiredData({ db, bucket, now, logger: silentLogger });

    assert.equal(result.comprovantesRemovidos, 1);
    assert.equal(result.acessosRemovidos, 0);
    assert.equal(result.arquivosRemovidos, 0);
    assert.equal(rerun.comprovantesEncontrados, 0);
    assert.equal(rerun.comprovantesRemovidos, 0);
});

class FakeFirestore {
    constructor(seed) {
        this.collections = new Map();

        for (const [collectionName, docs] of Object.entries(seed)) {
            this.collections.set(collectionName, new Map(Object.entries(docs)));
        }
    }

    collection(name) {
        return new FakeCollection(this, name);
    }

    batch() {
        return new FakeBatch();
    }

    hasDoc(collectionName, docId) {
        return this.collections.get(collectionName)?.has(docId) || false;
    }

    deleteDoc(collectionName, docId) {
        this.collections.get(collectionName)?.delete(docId);
    }
}

class FakeCollection {
    constructor(db, name, filters = [], ordering = null, max = null) {
        this.db = db;
        this.name = name;
        this.filters = filters;
        this.ordering = ordering;
        this.max = max;
    }

    where(field, operator, value) {
        return new FakeCollection(
            this.db,
            this.name,
            this.filters.concat({ field, operator, value }),
            this.ordering,
            this.max,
        );
    }

    orderBy(field, direction) {
        return new FakeCollection(this.db, this.name, this.filters, { field, direction }, this.max);
    }

    limit(max) {
        return new FakeCollection(this.db, this.name, this.filters, this.ordering, max);
    }

    async get() {
        const records = Array.from(this.db.collections.get(this.name)?.entries() || []).filter(
            ([, data]) => this.filters.every((filter) => matchesFilter(data, filter)),
        );

        if (this.ordering) {
            records.sort(([, left], [, right]) =>
                compareValues(
                    left[this.ordering.field],
                    right[this.ordering.field],
                    this.ordering.direction,
                ),
            );
        }

        const limited = typeof this.max === 'number' ? records.slice(0, this.max) : records;
        const docs = limited.map(([id, data]) => new FakeDocument(this.db, this.name, id, data));

        return {
            size: docs.length,
            docs,
        };
    }
}

class FakeDocument {
    constructor(db, collectionName, id, data) {
        this.id = id;
        this.ref = {
            delete: async () => db.deleteDoc(collectionName, id),
        };
        this.currentData = data;
    }

    data() {
        return this.currentData;
    }
}

class FakeBatch {
    constructor() {
        this.operations = [];
    }

    delete(ref) {
        this.operations.push(ref);
    }

    async commit() {
        for (const ref of this.operations) {
            await ref.delete();
        }
    }
}

class FakeBucket {
    constructor(paths, options = {}) {
        this.files = new Set(paths);
        this.deleteAsNotFound = options.deleteAsNotFound || new Set();
    }

    async getFiles({ prefix }) {
        return [
            Array.from(this.files)
                .filter((path) => path.startsWith(prefix))
                .map((path) => new FakeFile(this, path)),
        ];
    }

    hasFile(path) {
        return this.files.has(path);
    }
}

class FakeFile {
    constructor(bucket, path) {
        this.bucket = bucket;
        this.path = path;
    }

    async delete() {
        if (this.bucket.deleteAsNotFound.has(this.path)) {
            this.bucket.files.delete(this.path);
            const error = new Error('not found');
            error.code = 404;
            throw error;
        }

        this.bucket.files.delete(this.path);
    }
}

function matchesFilter(data, filter) {
    if (filter.operator === '<=') {
        return data[filter.field] <= filter.value;
    }

    if (filter.operator === '==') {
        return data[filter.field] === filter.value;
    }

    throw new Error(`Unsupported fake filter: ${filter.operator}`);
}

function compareValues(left, right, direction) {
    if (left < right) {
        return direction === 'desc' ? 1 : -1;
    }

    if (left > right) {
        return direction === 'desc' ? -1 : 1;
    }

    return 0;
}

const silentLogger = {
    info() {},
    error() {},
};
