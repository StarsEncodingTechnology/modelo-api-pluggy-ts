import * as http from 'http';
import { DecodedUserInterface } from './services/authService';

// esse arquivo sobreescreve o req para adicionar mais algumas
// informações importantes
// como as informações de decoded
// que nada mais é q a validação com JWT

declare module 'express-serve-static-core' {
  // sobreescreve o Request com todos as seus elementos e mais o decoded
  // sendo ele não obrigatorio
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodedUserInterface;
  }
}