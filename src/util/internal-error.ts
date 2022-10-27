export class InternalError extends Error {
  // classe que entende o erro padrão para
  // para personalizamos o erro a nossa vontade

  constructor(
    public message: string,
    protected code: number = 500,
    protected description?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
