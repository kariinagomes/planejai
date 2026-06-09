export function formatDate(value: string | undefined): string {
  if (!value) return '';

  const newDate = new Date(value);

  if (Number.isNaN(newDate.getTime())) return '';

  return newDate.toLocaleDateString('pt-BR');
}
