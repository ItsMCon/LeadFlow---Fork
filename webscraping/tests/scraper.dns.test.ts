import {
  criarLookupSeguro,
  type EnderecoDNS,
  type ResolverDNS,
} from "../src/dns.js";

type LookupTodos = (
  hostname: string,
  options: { all: true },
  callback: (
    erro: NodeJS.ErrnoException | null,
    enderecos: EnderecoDNS[],
  ) => void,
) => void;

function executarLookup(
  lookupSeguro: ReturnType<typeof criarLookupSeguro>,
  hostname: string,
): Promise<EnderecoDNS[]> {
  return new Promise((resolve, reject) => {
    const lookupTodos = lookupSeguro as unknown as LookupTodos;

    lookupTodos(hostname, { all: true }, (erro, enderecos) => {
      if (erro) {
        reject(erro);
        return;
      }

      resolve(enderecos);
    });
  });
}

function criarResolverSimulado(enderecos: EnderecoDNS[]): ResolverDNS {
  return (_hostname, _options, callback) => {
    callback(null, enderecos);
  };
}

function criarResolverComErro(): ResolverDNS {
  return (_hostname, _options, callback) => {
    const erro = Object.assign(new Error("Falha simulada na resolução DNS."), {
      code: "ENOTFOUND",
    });

    callback(erro, []);
  };
}

async function verificarRejeicao(
  lookupSeguro: ReturnType<typeof criarLookupSeguro>,
  codigoEsperado: string,
): Promise<void> {
  try {
    await executarLookup(lookupSeguro, "dominio-teste.com");

    throw new Error(
      `A consulta deveria ter sido rejeitada com ${codigoEsperado}.`,
    );
  } catch (erro) {
    if (
      !(erro instanceof Error) ||
      !("code" in erro) ||
      erro.code !== codigoEsperado
    ) {
      throw erro;
    }
  }
}

async function testar(
  descricao: string,
  executar: () => Promise<void>,
): Promise<boolean> {
  try {
    await executar();
    console.log(`APROVADO: ${descricao}`);
    return true;
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);

    console.error(`FALHOU: ${descricao}`);
    console.error(`Motivo: ${mensagem}`);

    return false;
  }
}

async function executarTestesDNS(): Promise<void> {
  console.log("========================================");
  console.log("TESTES DE DNS - LEADFLOW");
  console.log("========================================\n");

  let aprovados = 0;
  let total = 0;

  async function registrar(
    descricao: string,
    executar: () => Promise<void>,
  ): Promise<void> {
    total++;

    if (await testar(descricao, executar)) {
      aprovados++;
    }
  }

  // 1. Endereço IPv4 público deve ser permitido.
  await registrar("Permite endereço IPv4 público", async () => {
    const lookupSeguro = criarLookupSeguro(
      criarResolverSimulado([{ address: "93.184.216.34", family: 4 }]),
    );

    const resultado = await executarLookup(lookupSeguro, "empresa-teste.com");

    if (resultado[0].address !== "93.184.216.34") {
      throw new Error("Endereço público não foi preservado.");
    }
  });

  // 2. Endereço IPv6 público deve ser permitido.
  await registrar("Permite endereço IPv6 público", async () => {
    const lookupSeguro = criarLookupSeguro(
      criarResolverSimulado([
        {
          address: "2606:2800:220:1:248:1893:25c8:1946",
          family: 6,
        },
      ]),
    );

    const resultado = await executarLookup(lookupSeguro, "empresa-teste.com");

    if (resultado[0].family !== 6) {
      throw new Error("Endereço IPv6 não foi preservado.");
    }
  });

  // 3. Loopback IPv4 deve ser bloqueado.
  await registrar("Bloqueia DNS que retorna 127.0.0.1", async () => {
    const lookupSeguro = criarLookupSeguro(
      criarResolverSimulado([{ address: "127.0.0.1", family: 4 }]),
    );

    await verificarRejeicao(lookupSeguro, "EACCES");
  });

  // 4. Rede privada 10.0.0.0/8 deve ser bloqueada.
  await registrar(
    "Bloqueia DNS que retorna IP da faixa 10.0.0.0/8",
    async () => {
      const lookupSeguro = criarLookupSeguro(
        criarResolverSimulado([{ address: "10.0.0.1", family: 4 }]),
      );

      await verificarRejeicao(lookupSeguro, "EACCES");
    },
  );

  // 5. Rede privada 192.168.0.0/16 deve ser bloqueada.
  await registrar(
    "Bloqueia DNS que retorna IP da faixa 192.168.0.0/16",
    async () => {
      const lookupSeguro = criarLookupSeguro(
        criarResolverSimulado([{ address: "192.168.1.1", family: 4 }]),
      );

      await verificarRejeicao(lookupSeguro, "EACCES");
    },
  );

  // 6. Endereço link-local deve ser bloqueado.
  await registrar("Bloqueia DNS que retorna IP link-local", async () => {
    const lookupSeguro = criarLookupSeguro(
      criarResolverSimulado([{ address: "169.254.169.254", family: 4 }]),
    );

    await verificarRejeicao(lookupSeguro, "EACCES");
  });

  // 7. Loopback IPv6 deve ser bloqueado.
  await registrar("Bloqueia DNS que retorna ::1", async () => {
    const lookupSeguro = criarLookupSeguro(
      criarResolverSimulado([{ address: "::1", family: 6 }]),
    );

    await verificarRejeicao(lookupSeguro, "EACCES");
  });

  // 8. Uma resposta mista deve ser totalmente bloqueada.
  await registrar(
    "Bloqueia resposta DNS com IP público e privado",
    async () => {
      const lookupSeguro = criarLookupSeguro(
        criarResolverSimulado([
          { address: "93.184.216.34", family: 4 },
          { address: "192.168.1.10", family: 4 },
        ]),
      );

      await verificarRejeicao(lookupSeguro, "EACCES");
    },
  );

  // 9. Resposta DNS vazia deve ser rejeitada.
  await registrar("Rejeita resolução DNS sem endereços", async () => {
    const lookupSeguro = criarLookupSeguro(criarResolverSimulado([]));

    await verificarRejeicao(lookupSeguro, "ENOTFOUND");
  });

  // 10. Erro do resolvedor deve ser propagado.
  await registrar("Propaga erros do resolvedor DNS", async () => {
    const lookupSeguro = criarLookupSeguro(criarResolverComErro());

    await verificarRejeicao(lookupSeguro, "ENOTFOUND");
  });

  // 11. Consulta DNS real de um domínio público.
  await registrar("Resolve domínio público usando DNS real", async () => {
    const lookupSeguro = criarLookupSeguro();

    const resultado = await executarLookup(lookupSeguro, "example.com");

    if (resultado.length === 0) {
      throw new Error("O domínio não retornou endereços.");
    }

    console.log(
      "  Endereços retornados:",
      resultado.map((item) => item.address).join(", "),
    );
  });

  console.log("\n========================================");
  console.log(`${aprovados}/${total} testes aprovados.`);
  console.log("========================================");

  if (aprovados !== total) {
    process.exitCode = 1;
  }
}

executarTestesDNS().catch((erro) => {
  console.error("Erro inesperado nos testes:", erro);
  process.exitCode = 1;
});
