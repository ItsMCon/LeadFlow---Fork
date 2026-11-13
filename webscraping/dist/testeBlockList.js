"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_net_1 = require("node:net");
const endereco = "104.20.23.154";
const faixas = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
];
console.log(`Verificando ${endereco}...\n`);
for (const [rede, prefixo] of faixas) {
    const lista = new node_net_1.BlockList();
    lista.addSubnet(rede, prefixo, "ipv4");
    const bloqueado = lista.check(endereco, "ipv4");
    console.log(`${rede}/${prefixo}: ${bloqueado ? "BLOQUEADO" : "permitido"}`);
}
