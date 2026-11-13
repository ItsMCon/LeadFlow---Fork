import assert from "node:assert/strict";
import { Agent, fetch } from "undici";

import { criarLookupSeguro, type ResolverDNS } from "../src/dns.js";

const HOST_TESTE = "leadflow-teste.invalid";

let aprovados = 0;
let reprovados = 0;

async function executarTeste(
  nome: string,
  teste: () => Promise<void>,
): Promise<void> {
  try {
    await teste();
    aprovados++;
    console.log(`APROVADO: ${nome}`);
  } catch (erro) {
    reprovados++;
    console.error(`REPROVADO: ${nome}`);
    console.error(erro);
  }
}

async function testarDNSPrivadoNoAgent(): Promise<void> {
  let chamadasDNS = 0;

  const resolver: ResolverDNS = (_hostname, _options, callback) => {
    chamadasDNS++;

    callback(null, [
      {
        address: "127.0.0.1",
        family: 4,
      },
    ]);
  };

  const agente = new Agent({
    connect: {
      lookup: criarLookupSeguro(resolver),
    },
  });

  try {
    await assert.rejects(async () => {
      await fetch(`http://${HOST_TESTE}`, {
        dispatcher: agente,
      });
    });

    assert.equal(
      chamadasDNS,
      1,
      "O agente deveria ter utilizado o resolvedor DNS seguro.",
    );
  } finally {
    await agente.close();
  }
}

async function testarDNSMistoNoAgent(): Promise<void> {
  let chamadasDNS = 0;

  const resolver: ResolverDNS = (_hostname, _options, callback) => {
    chamadasDNS++;

    callback(null, [
      {
        address: "93.184.216.34",
        family: 4,
      },
      {
        address: "192.168.1.10",
        family: 4,
      },
    ]);
  };

  const agente = new Agent({
    connect: {
      lookup: criarLookupSeguro(resolver),
    },
  });

  try {
    await assert.rejects(async () => {
      await fetch(`http://${HOST_TESTE}`, {
        dispatcher: agente,
      });
    });

    assert.equal(
      chamadasDNS,
      1,
      "O agente deveria ter consultado o resolvedor DNS.",
    );
  } finally {
    await agente.close();
  }
}

async function main(): Promise<void> {
  console.log("========================================");
  console.log("TESTES DE INTEGRAÇÃO DNS - LEADFLOW");
  console.log("========================================\n");

  await executarTeste(
    "Agent bloqueia conexão quando DNS retorna IP privado",
    testarDNSPrivadoNoAgent,
  );

  await executarTeste(
    "Agent bloqueia resposta DNS com IP público e privado",
    testarDNSMistoNoAgent,
  );

  console.log("\n========================================");
  console.log(`Aprovados: ${aprovados}`);
  console.log(`Reprovados: ${reprovados}`);
  console.log(`Total: ${aprovados + reprovados}`);
  console.log("========================================");

  if (reprovados > 0) {
    process.exitCode = 1;
  }
}

main();
