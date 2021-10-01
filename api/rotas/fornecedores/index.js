const roteador = require('express').Router();
const TabelaFornecedor = require('./TabelaFornecedor');
const Fornecedor = require('./Fornecedor');
const SerializadorFornecedor = require('../../serializador').SerializadorFornecedor

roteador.options('/', (requisicao, resposta) => {
  resposta.set('Access-Control-Allow-Methods', 'GET, POST');
  resposta.set('Access-Control-Allow-Headers', 'Content-Type');
  resposta.status(204);
});

roteador.get('/', async (requisicao, resposta) => {
  // listar é o novo nome de findAll
  const resultados = await TabelaFornecedor.listar();
   /*resposta.send(
    JSON.stringify(resultados)
  );*/
  // Retorna o json
  resposta.status(200);
  const serializador = new SerializadorFornecedor(
    resposta.getHeader('Content-type')
  );
  resposta.send(serializador.serializar(resultados));
});

roteador.post('/', async (requisicao, resposta, proximo) => {
  try{
    const dadosRecebidos = requisicao.body;
    const fornecedor = new Fornecedor(dadosRecebidos);

    await fornecedor.criar();
    /*resposta.send(
      JSON.stringify(fornecedor)
    );*/
    // Retorna o json
    resposta.status(201);
    const serializador = new SerializadorFornecedor(
      resposta.getHeader('Content-type')
    );
    resposta.send(serializador.serializar(fornecedor));
  }catch(erro){  
    proximo(erro);
  }
});

roteador.options('/:idFornecedor', (requisicao, resposta) => {
  resposta.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
  resposta.set('Access-Control-Allow-Headers', 'Content-Type');
  resposta.status(204);
});

roteador.get('/:idFornecedor', async (requisicao, resposta, proximo) => {
  try {
    const id = requisicao.params.idFornecedor;
    const fornecedor = new Fornecedor({ id: id });
    await fornecedor.carregar();
    /*resposta.send(
      JSON.stringify(fornecedor)
    );*/
    // Retorna o json
    resposta.status(200);
    const serializador = new SerializadorFornecedor(
      resposta.getHeader('Content-type'),
      //adicionando campos extras
      ['email', 'dataCriacao', 'dataAtualizacao', 'versao']
    );
    resposta.send(serializador.serializar(fornecedor));
  } catch (erro) {
    proximo(erro);
  }
});

roteador.put('/:idFornecedor', async (requisicao, resposta, proximo) => { 
  try{
    const id = requisicao.params.idFornecedor;
    const dadosRecebidos = requisicao.body;
    // Object.assign junta objetos em um só
    const dados = Object.assign({}, dadosRecebidos, { id: id });
    const fornecedor = new Fornecedor(dados);

    await fornecedor.atualizar();

    //resposta.status(204);
    resposta.send({
      statusCode: 204,
      mensagem: 'Atualizado com sucesso!'
    });
  }catch(erro){
    proximo(erro);
  }
});

roteador.delete('/:idFornecedor', async (requisicao, resposta, proximo) => {
  try{
    const id = requisicao.params.idFornecedor;
    const fornecedor = new Fornecedor({ id: id});
    await fornecedor.carregar();
    await fornecedor.remover();

    //resposta.status(204);
    resposta.send({
      statusCode: 204,
      mensagem: 'Deletado com sucesso!'
    });
  }catch(erro){
    proximo(erro);
  }
});

const roteadorProdutos = require('./produtos');

const verificarFornecedor = async (requisicao, resposta, proximo) => {
  try{
    const id = requisicao.params.idFornecedor;
    const fornecedor = new Fornecedor({id: id});
    await fornecedor.carregar();
    requisicao.fornecedor = fornecedor;
    proximo();
  }catch(erro){
    proximo(erro);
  }
}

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos);

module.exports = roteador;