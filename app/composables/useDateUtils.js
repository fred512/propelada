/**
 * Format an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:...) to DD/MM/YYYY.
 */
export function formatDateBR(iso) {
  if (!iso) return '--/--/----'
  const [year, month, day] = iso.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

/**
 * Returns the current year range (start of year → today) as ISO date strings.
 */
export function useYearRange() {
  const today = new Date()
  const year = today.getFullYear()
  return {
    dataIni: `${year}-01-01`,
    dataHoje: today.toISOString().split('T')[0]
  }
}
