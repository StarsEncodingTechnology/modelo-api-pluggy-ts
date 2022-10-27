import * as path from "path";
import moduleAlias from "module-alias";

// configuração para que o alias funcione
// essa configuração permite o uso de @src e @test

const files = path.resolve(__dirname, "../..");

moduleAlias.addAliases({
  "@src": path.join(files, "src"),
  "@test": path.join(files, "test"),
});
