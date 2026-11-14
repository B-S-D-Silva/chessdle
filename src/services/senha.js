const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const derivar = promisify(scrypt);
async function criarHash(senha) {
    const sal = randomBytes(16).toString("hex");
    const hash = await derivar(senha, sal, 64);
    return "scrypt$" + sal + "$" + hash.toString("hex");
}
async function verificarSenha(senha, armazenada) {
    if (!armazenada.startsWith("scrypt$")) {
        // Compatibilidade temporária: converte a senha legada após autenticação válida.
        const antiga = Buffer.from(armazenada);
        const recebida = Buffer.from(senha);
        return antiga.length === recebida.length && timingSafeEqual(antiga, recebida);
    }
    const partes = armazenada.split("$");
    if (partes.length !== 3 || !/^[a-f0-9]{32}$/.test(partes[1]) || !/^[a-f0-9]{128}$/.test(partes[2])) return false;
    const hash = await derivar(senha, partes[1], 64);
    return timingSafeEqual(hash, Buffer.from(partes[2], "hex"));
}
module.exports = { criarHash, verificarSenha };
