class ErroRequisicao extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.name = "ErroRequisicao";
    this.status = status;
  }
}

module.exports = { ErroRequisicao };
