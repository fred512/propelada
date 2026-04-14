/**
 * Referência interna de cores de times.
 * O banco guarda apenas o NOME. O hex é derivado aqui.
 */
const CORES_TIMES = [
  { nome: 'Azul',     hex: '#2196F3' },
  { nome: 'Amarelo',  hex: '#FFD600' },
  { nome: 'Verde',    hex: '#4CAF50' },
  { nome: 'Vermelho', hex: '#F44336' },
  { nome: 'Laranja',  hex: '#FF9800' },
  { nome: 'Roxo',     hex: '#9C27B0' },
  { nome: 'Rosa',     hex: '#E91E63' },
  { nome: 'Preto',    hex: '#212121' },
  { nome: 'Branco',   hex: '#FAFAFA' },
]

export const useTeamColors = () => {
  const hexDaCor = (nome) =>
    CORES_TIMES.find(c => c.nome === nome)?.hex ?? '#2196F3'

  return { cores: CORES_TIMES, hexDaCor }
}
