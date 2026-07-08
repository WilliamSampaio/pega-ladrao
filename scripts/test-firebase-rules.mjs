import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  getDownloadURL,
  listAll,
  ref as storageRef,
  uploadString,
} from 'firebase/storage';

const PROJECT_ID = 'pega-ladrao-rules-test';

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
  },
  storage: {
    rules: readFileSync('storage.rules', 'utf8'),
  },
});

async function seedComprovante() {
  const owner = testEnv.authenticatedContext('owner-uid');
  const db = owner.firestore();
  const ref = doc(collection(db, 'comprovantes'));

  await assertSucceeds(setDoc(ref, {
    instituicao: 'bradesco',
    nomePagador: 'PAGADOR TESTE',
    cpfPagador: '***.123.456-**',
    valor: 10,
    descricao: '',
    dataHora: Timestamp.fromDate(new Date()),
    nomePilantra: '',
    cpfPilantra: '',
    cnpjPilantra: '',
    chavePixPilantra: '',
    tipoChavePixPilantra: null,
    expiracao: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
    ownerUid: 'owner-uid',
  }));

  return ref.id;
}

try {
  const comprovanteId = await seedComprovante();

  const publicDb = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(publicDb, 'comprovantes', comprovanteId)));

  await assertFails(setDoc(doc(collection(publicDb, 'comprovantes')), {
    instituicao: 'bradesco',
    nomePagador: 'SEM DONO',
    cpfPagador: '***.123.456-**',
    valor: 10,
    dataHora: Timestamp.fromDate(new Date()),
    expiracao: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
    ownerUid: 'owner-uid',
  }));

  const acessoBasicoRef = doc(collection(publicDb, 'acessos'));
  await assertSucceeds(setDoc(acessoBasicoRef, {
    comprovanteId,
    ownerUid: 'owner-uid',
    at: serverTimestamp(),
    consentimentoEvidencias: false,
    userAgent: 'rules-test',
    language: 'pt-BR',
    screenWidth: 390,
    screenHeight: 844,
  }));

  const acessoEvidenciaRef = doc(collection(publicDb, 'acessos'));
  await assertSucceeds(setDoc(acessoEvidenciaRef, {
    comprovanteId,
    ownerUid: 'owner-uid',
    at: serverTimestamp(),
    consentimentoEvidencias: true,
    publicIp: '203.0.113.10',
    userAgent: 'rules-test',
    language: 'pt-BR',
    screenWidth: 390,
    screenHeight: 844,
    fotoCapturada: true,
    deviceId: 'device-1',
    manufacturer: 'Test',
    model: 'Browser',
    operatingSystem: 'web',
    osVersion: '1',
    platform: 'web',
    webViewVersion: '1',
    accuracy: 10,
    latitude: -3.1,
    longitude: -60.0,
  }));

  await assertFails(setDoc(doc(collection(publicDb, 'acessos')), {
    comprovanteId,
    ownerUid: 'other-uid',
    at: serverTimestamp(),
  }));

  const ownerDb = testEnv.authenticatedContext('owner-uid').firestore();
  const ownerQuery = query(
    collection(ownerDb, 'acessos'),
    where('comprovanteId', '==', comprovanteId),
    where('ownerUid', '==', 'owner-uid'),
    orderBy('at', 'desc')
  );
  const docs = await assertSucceeds(getDocs(ownerQuery));
  assert.equal(docs.size, 2);

  const otherDb = testEnv.authenticatedContext('other-uid').firestore();
  await assertFails(getDoc(doc(otherDb, 'acessos', acessoEvidenciaRef.id)));

  const publicStorage = testEnv.unauthenticatedContext().storage();
  const photoPath = 'capturas/owner-uid/' + comprovanteId + '/' + acessoEvidenciaRef.id + '/photo.jpg';
  await assertSucceeds(uploadString(storageRef(publicStorage, photoPath), 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'data_url'));

  const ownerStorage = testEnv.authenticatedContext('owner-uid').storage();
  await assertSucceeds(listAll(storageRef(ownerStorage, 'capturas/owner-uid/' + comprovanteId)));
  await assertSucceeds(getDownloadURL(storageRef(ownerStorage, photoPath)));

  const otherStorage = testEnv.authenticatedContext('other-uid').storage();
  await assertFails(getDownloadURL(storageRef(otherStorage, photoPath)));

  console.log('Firebase rules tests passed');
} finally {
  await testEnv.cleanup();
}
