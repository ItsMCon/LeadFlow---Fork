import assert from "node:assert/strict";

import { criarLookupSeguro, type ResolverDNS } from "../src/dns.js";

const HOST_TESTE = "leadflow-rebinding.invalid";

async function main(): Promise<void> {
  console.log("========================================");
  console.log("TESTES DE DNS REBINDING - LEADFLOW");
  console.log("========================================\n");

  let chamadasDNS = 0;

  const resolver: ResolverDNS = (_hostname, _options, callback) => {
    chamadasDNS++;

    if (chamadasDNS === 1) {
      callback(null, [
        {
          address: "93.184.216.34",
          family: 4,
        },
      ]);

      return;
    }

    callback(null, [
      {
        address: "127.0.0.1",
        family: 4,
      },
    ]);
  };

  const lookupSeguro = criarLookupSeguro(resolver);

  // Primeira consulta: endereço público.
  await new Promise<void>((resolve, reject) => {
    lookupSeguro(HOST_TESTE, { all: true }, (erro, enderecos) => {
      if (erro) {
        reject(erro);
        return;
      }

      try {
        // Com all: true, o retorno esperado é uma lista.
        const lista = enderecos as Array<{
          address: string;
          family: number;
        }>;

        assert.equal(lista.length, 1);
        assert.equal(lista[0].address, "93.184.216.34");

        resolve();
      } catch (erroTeste) {
        reject(erroTeste);
      }
    });
  });

  console.log("APROVADO: Primeira consulta aceita IP público");

  // Segunda consulta: mesmo domínio, agora com IP privado.
  const segundaConsulta = new Promise<void>((resolve, reject) => {
    lookupSeguro(HOST_TESTE, { all: true }, (erro) => {
      try {
        assert.ok(erro);
        assert.equal(erro.code, "EACCES");

        resolve();
      } catch (erroTeste) {
        reject(erroTeste);
      }
    });
  });

  await segundaConsulta;

  console.log("APROVADO: Segunda consulta bloqueia IP privado");

  assert.equal(chamadasDNS, 2);

  console.log("APROVADO: O resolvedor consultou o DNS novamente");

  console.log("\n========================================");
  console.log("3/3 testes aprovados.");
  console.log("========================================");
}

main().catch((erro) => {
  console.error("\nFALHA NOS TESTES:");
  console.error(erro);
  process.exitCode = 1;
});
