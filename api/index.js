const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const NaoEncontrado = require('./erros/NaoEcontrado');
const CampoInvalido = require('./erros/CampoInvalido');
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos');
const ValorNaoSuportado = require('./erros/ValorNaoSuportado');
const { formatosAceitos, SerializadorErro } = require('./serializador');
const cors = require('cors');

app.use(bodyParser.json());

app.use((requisicao, resposta, proximo) =>{
  let formatoRequisitado = requisicao.header('Accept');

  if(formatoRequisitado === '*/*'){
    formatoRequisitado = 'application/json'
  }

  if(formatosAceitos.indexOf(formatoRequisitado) === -1){
    resposta.status(406).send({
      statusCode: 406, 
      mensagem: 'Formato não suportado'
    });
    resposta.end();
  }

  resposta.setHeader('Content-Type', formatoRequisitado);
  proximo();
});

app.use(cors());

//const serializador = require('./serializador');
const roteador = require('./rotas/fornecedores');
app.use('/api/fornecedores', roteador);

app.use((erro, requisicao, resposta, proximo) => {
  let status = 500;

  if(erro instanceof NaoEncontrado){
    status = 404;
  }

  if(erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos){
    status = 400;
  }

  if(erro instanceof ValorNaoSuportado){
    status = 406;
  }

  const serializador = new SerializadorErro(
    resposta.getHeader('Content-Type')
  )
  
  resposta.status(status);
  resposta.send(serializador.serializar({
    statusCode: status,
    mensagem: erro.message,
    id: erro.idErro
  })); 
});

app.listen(config.get('api.porta'), () => console.log('API está funcionando!'));