import * as path from "path";
import moduleAlias from "module-alias";

// configuração para o axios funcione

const files = path.resolve(__dirname, "../..");

moduleAlias.addAliases({
  "@src": path.join(files, "src"),
  "@test": path.join(files, "test"),
});
