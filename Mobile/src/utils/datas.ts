// Retorna a data local no formato YYYY-MM-DD considerando a "virada de dia" às 04:00
// Antes das 04:00, o dia ainda é o anterior (ex: 03:50 de sexta ainda é "quinta")
export function dataLocal(): string {
  const agora = new Date();
  // Subtrai 4 horas para fazer a virada às 04:00
  const ajustada = new Date(agora.getTime() - 4 * 60 * 60 * 1000);
  const ano = ajustada.getFullYear();
  const mes = String(ajustada.getMonth() + 1).padStart(2, '0');
  const dia = String(ajustada.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
