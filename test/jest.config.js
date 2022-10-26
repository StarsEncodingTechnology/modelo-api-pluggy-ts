// configuração end to end do sistema
// teste funcional
// sobreescreve a configuração global

const { resolve } = require("path");
const root = resolve(__dirname, "..");
// aponta para a pasta do projeto

const rootConfig = require(`${root}/jest.config.js`);
// importa a global para sobre-escrever
// algumas chaves

// faz a marge do obj global e o abaixo
module.exports = {
  ...rootConfig,
  ...{
    rootDir: root,
    displayName: "end2end-tests",
    // altera o nome do display
    // aparecera do lado do test
    setupFilesAfterEnv: ["<rootDir>/test/jest-setup.ts"],
    // arquivo de setup antes de rodar os testes
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    // somente arquivo que estão na pastas testes
    // e somentes aqueles que contém o .test.ts
  },
};
