class NaoEncontrado extends Error {
  constructor(nome) {
    const mensagem = `${nome} não foi encontrado!`
    super(mensagem);
    this.name = 'NaoEncontrado';
    this.idErro = 0;
  }
}

module.exports = NaoEncontrado;