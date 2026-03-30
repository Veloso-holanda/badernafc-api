/**
 * Script de migração: Single-tenant → Multi-tenant
 *
 * Este script migra os dados existentes do Baderna FC para a nova estrutura multi-tenant.
 *
 * O que faz:
 * 1. Cria um Time "Baderna FC" com o admin atual como criador
 * 2. Adiciona o campo `time` a todos os documentos existentes (jogadores, ciclos, partidas, despesas, config)
 * 3. Cria Membro para cada usuario existente
 * 4. Remove o campo `jogador` dos documentos Usuario
 * 5. Atualiza indexes
 *
 * Como executar:
 *   npx ts-node -r tsconfig-paths/register src/scripts/migracao-multi-tenant.ts
 *
 * IMPORTANTE: Fazer backup do banco antes de executar!
 */

import { connect, connection, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { config } from 'dotenv';

config();

async function migrar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI não definida no .env');
    process.exit(1);
  }

  await connect(uri);
  console.log('Conectado ao MongoDB');

  const db = connection.db!;

  // 1. Buscar admin atual
  const adminUsuario = await db
    .collection('usuarios')
    .findOne({ perfil: 'admin' });

  if (!adminUsuario) {
    console.error('Nenhum usuario admin encontrado. Abortando.');
    process.exit(1);
  }
  console.log(`Admin encontrado: ${adminUsuario.nome} (${adminUsuario._id})`);

  // 2. Criar Time "Baderna FC"
  const codigoConvite = randomBytes(4).toString('hex').toUpperCase();
  const timeResult = await db.collection('times').insertOne({
    nome: 'Baderna FC',
    descricao: 'Time original do Baderna FC',
    logoUrl: '',
    codigoConvite,
    criador: adminUsuario._id,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const timeId = timeResult.insertedId;
  console.log(`Time criado: Baderna FC (${timeId}) | codigo: ${codigoConvite}`);

  // 3. Criar ConfiguracoesGerais para o time (migrar a existente)
  const configExistente = await db
    .collection('configuracoesgerais')
    .findOne({});
  if (configExistente) {
    await db
      .collection('configuracoesgerais')
      .updateOne(
        { _id: configExistente._id },
        { $set: { time: timeId, updatedAt: new Date() } },
      );
    console.log('ConfiguracoesGerais migrada com campo time');
  } else {
    await db.collection('configuracoesgerais').insertOne({
      time: timeId,
      valorCicloMensal: 500,
      diaria: 25,
      valorMensalista: 100,
      diaFutebol: 3,
      horaFutebol: '19:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('ConfiguracoesGerais criada com defaults');
  }

  // 4. Adicionar campo `time` a todos os jogadores
  const jogadoresResult = await db
    .collection('jogadors')
    .updateMany({}, { $set: { time: timeId, updatedAt: new Date() } });
  console.log(`${jogadoresResult.modifiedCount} jogadores atualizados`);

  // 5. Adicionar campo `time` a todos os ciclos mensais
  const ciclosResult = await db
    .collection('ciclomensals')
    .updateMany({}, { $set: { time: timeId, updatedAt: new Date() } });
  console.log(`${ciclosResult.modifiedCount} ciclos mensais atualizados`);

  // 6. Adicionar campo `time` a todas as partidas
  const partidasResult = await db
    .collection('partidas')
    .updateMany({}, { $set: { time: timeId, updatedAt: new Date() } });
  console.log(`${partidasResult.modifiedCount} partidas atualizadas`);

  // 7. Adicionar campo `time` a todas as despesas
  const despesasResult = await db
    .collection('despesas')
    .updateMany({}, { $set: { time: timeId, updatedAt: new Date() } });
  console.log(`${despesasResult.modifiedCount} despesas atualizadas`);

  // 8. Criar Membro para cada usuario existente
  const usuarios = await db.collection('usuarios').find({}).toArray();
  const membros = usuarios.map((usuario) => ({
    time: timeId,
    usuario: usuario._id,
    jogador: usuario.jogador || null,
    papel: usuario.perfil === 'admin' ? 'admin' : 'membro',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (membros.length > 0) {
    await db.collection('membros').insertMany(membros);
    console.log(`${membros.length} membros criados`);
  }

  // 9. Remover campo `jogador` dos documentos Usuario
  await db
    .collection('usuarios')
    .updateMany(
      {},
      { $unset: { jogador: '' }, $set: { updatedAt: new Date() } },
    );
  console.log('Campo jogador removido dos usuarios');

  // 10. Atualizar indexes
  try {
    await db.collection('jogadors').dropIndex('codigoVincular_1');
    console.log('Index antigo codigoVincular_1 removido');
  } catch (e) {
    console.log('Index codigoVincular_1 nao existia, ok');
  }

  await db
    .collection('jogadors')
    .createIndex({ time: 1, codigoVincular: 1 }, { unique: true });
  console.log('Index composto { time, codigoVincular } criado');

  await db
    .collection('configuracoesgerais')
    .createIndex({ time: 1 }, { unique: true });
  console.log('Index unico { time } criado em configuracoesgerais');

  await db
    .collection('membros')
    .createIndex({ time: 1, usuario: 1 }, { unique: true });
  console.log('Index composto { time, usuario } criado em membros');

  console.log('\nMigração concluída com sucesso!');
  console.log(`Time: Baderna FC (${timeId})`);
  console.log(`Código de convite: ${codigoConvite}`);

  await connection.close();
}

migrar().catch((err) => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
