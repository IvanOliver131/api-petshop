const Modelo = require('./ModeloTabelaProduto');
const instancia = require('../../../database');
const NaoEncontrado = require('../../../erros/NaoEcontrado');

module.exports = {
  listar(idFornecedor){
    return Modelo.findAll({
      where: {
        fornecedor: idFornecedor
      }, 
      //retorna valor em ojeto JSON puro
      raw: true
    });
  },
  inserir(dados){
    console.log('cheguei aki')
    return Modelo.create(dados);
  },
  remover(idProduto, idFornecedor){
    return Modelo.destroy({
      where: {
        id: idProduto,
        fornecedor: idFornecedor
      }
    });
  },
  async pegarPorId(idProduto, idFornecedor){
    const encontrado = await Modelo.findOne({
      where: {
        id: idProduto,
        fornecedor: idFornecedor
      }
    });

    if(!encontrado){
      throw new NaoEncontrado('Produto');
    }

    return encontrado;
  },
  atualizar(dadosDoProduto, dadosParaAtualizar){
    return Modelo.update(
      dadosParaAtualizar,
      {
        where: dadosDoProduto
      }
    )
  },
  subtrair(idProduto, idFornecedor, campo, quantidade){
    //pode haver concorrencia na api por tanto vamos usar transaçoes de mySql com Sequelize
    return instancia.transaction(async transacao => {
      const produto = await Modelo.findOne({
        where: {
          id: idProduto,
          fornecedor: idFornecedor
        }
      });

      produto[campo] = quantidade;

      await produto.save();

      return produto;
    });
  
  }
}