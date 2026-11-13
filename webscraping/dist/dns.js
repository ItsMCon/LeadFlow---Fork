"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipBloqueado = ipBloqueado;
exports.criarLookupSeguro = criarLookupSeguro;
const node_net_1 = require("node:net");
const node_dns_1 = require("node:dns");
const ipsBloqueados = new node_net_1.BlockList();
// IPv4 privados, locais, reservados e não roteáveis.
const faixasIPv4 = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.88.99.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
];
for (const [endereco, prefixo] of faixasIPv4) {
    ipsBloqueados.addSubnet(endereco, prefixo, "ipv4");
}
// IPv6: somente endereços globais são considerados candidatos.
// Endereços especiais e não roteáveis são bloqueados.
ipsBloqueados.addSubnet("::", 128, "ipv6");
ipsBloqueados.addSubnet("::1", 128, "ipv6");
ipsBloqueados.addSubnet("fc00::", 7, "ipv6");
ipsBloqueados.addSubnet("fe80::", 10, "ipv6");
ipsBloqueados.addSubnet("ff00::", 8, "ipv6");
ipsBloqueados.addSubnet("2001:db8::", 32, "ipv6");
ipsBloqueados.addSubnet("2001::", 23, "ipv6");
ipsBloqueados.addSubnet("2002::", 16, "ipv6");
ipsBloqueados.addSubnet("3fff::", 20, "ipv6");
function erroDNS(mensagem, codigo) {
    const erro = new Error(mensagem);
    erro.code = codigo;
    return erro;
}
function ipBloqueado(endereco) {
    const familia = (0, node_net_1.isIP)(endereco);
    // Endereço inválido nunca é aceito.
    if (familia === 0) {
        return true;
    }
    if (familia === 4) {
        return ipsBloqueados.check(endereco, "ipv4");
    }
    // Bloqueia IPv4 mapeado em IPv6, inclusive formato hexadecimal.
    const enderecoNormalizado = endereco.toLowerCase();
    if (enderecoNormalizado.startsWith("::ffff:")) {
        return true;
    }
    // Aceita somente o espaço global unicast 2000::/3.
    // Isso rejeita automaticamente IPv6 não global.
    const dentroDoGlobalUnicast = ipsBloqueados.check(endereco, "ipv6") === false;
    const globalUnicast = (() => {
        const blocos = endereco.split(":");
        const primeiroBloco = parseInt(blocos[0] || "0", 16);
        return primeiroBloco >= 0x2000 && primeiroBloco <= 0x3fff;
    })();
    if (!globalUnicast || !dentroDoGlobalUnicast) {
        return true;
    }
    return false;
}
const resolverDNSPadrao = (hostname, options, callback) => {
    (0, node_dns_1.lookup)(hostname, options, callback);
};
function criarLookupSeguro(resolver = resolverDNSPadrao) {
    const lookupSeguro = (hostname, options, callback) => {
        resolver(hostname, {
            all: true,
            verbatim: true,
            family: 0,
        }, (erro, enderecos) => {
            if (erro) {
                if (options?.all) {
                    callback(erro, []);
                }
                else {
                    callback(erro, "", 0);
                }
                return;
            }
            if (!enderecos || enderecos.length === 0) {
                const erroVazio = erroDNS(`Nenhum endereço IP encontrado para ${hostname}.`, "ENOTFOUND");
                if (options?.all) {
                    callback(erroVazio, []);
                }
                else {
                    callback(erroVazio, "", 0);
                }
                return;
            }
            // Rejeita toda a resposta se qualquer endereço
            // for inválido, privado ou reservado.
            const enderecoBloqueado = enderecos.find((item) => !item ||
                typeof item.address !== "string" ||
                (0, node_net_1.isIP)(item.address) !== item.family ||
                ipBloqueado(item.address));
            if (enderecoBloqueado) {
                const endereco = enderecoBloqueado.address || "inválido";
                const erroSeguranca = erroDNS(`Resolução DNS bloqueada: ${hostname} retornou endereço não permitido ${endereco}.`, "EACCES");
                if (options?.all) {
                    callback(erroSeguranca, []);
                }
                else {
                    callback(erroSeguranca, "", 0);
                }
                return;
            }
            const familiaSolicitada = typeof options === "number" ? options : options?.family || 0;
            const enderecosValidos = familiaSolicitada
                ? enderecos.filter((item) => item.family === familiaSolicitada)
                : enderecos;
            if (enderecosValidos.length === 0) {
                const erroFamilia = erroDNS(`Nenhum endereço compatível encontrado para ${hostname}.`, "ENOTFOUND");
                if (options?.all) {
                    callback(erroFamilia, []);
                }
                else {
                    callback(erroFamilia, "", 0);
                }
                return;
            }
            if (options?.all) {
                callback(null, enderecosValidos);
            }
            else {
                callback(null, enderecosValidos[0].address, enderecosValidos[0].family);
            }
        });
    };
    return lookupSeguro;
}
