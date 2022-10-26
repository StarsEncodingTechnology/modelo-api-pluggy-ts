import { SetupServer } from "./server";




(async () => {
    // função que inicia a aplicação
    // mas sem configuração de erros 

    // const port = process.env.PORT
    const server = new SetupServer();
    server.init();
    server.start()
})();