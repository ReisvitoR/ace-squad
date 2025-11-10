/**
 * Funções utilitárias para lidar com timezone do Brasil (America/Sao_Paulo)
 */

/**
 * Converte uma data UTC para o horário do Brasil
 */
export function utcToBrasil(dateString: string): Date {
  const date = new Date(dateString);
  // O date-fns já usa o timezone local do navegador
  // Se o servidor retorna UTC, o JavaScript já faz a conversão automaticamente
  return date;
}

/**
 * Formata uma data string (possivelmente UTC) para exibição no horário do Brasil
 */
export function formatBrasilDateTime(dateString: string, formatStr: string = "dd/MM/yyyy HH:mm"): string {
  const date = utcToBrasil(dateString);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Converte uma data/hora local do input datetime-local para ISO string
 * mantendo a intenção do horário do Brasil
 */
export function localToISO(localDateTimeString: string): string {
  // O input datetime-local retorna no formato "YYYY-MM-DDTHH:mm"
  // Precisamos criar a data como se fosse no Brasil e converter para UTC
  const date = new Date(localDateTimeString);
  return date.toISOString();
}
