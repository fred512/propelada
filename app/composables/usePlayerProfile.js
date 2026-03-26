import { ref } from 'vue'

/**
 * Pure function — calculates score from a player's match/waiting records.
 */
export function calcularPontuacao(jogadas, esperas, criterios, dataIni, dataHoje) {
  const c = criterios
  const jogadasAno = (jogadas || []).filter(j => {
    const d = j.partida?.Data
    return d && d >= dataIni && d <= dataHoje
  })
  const idPelada = criterios.IdPelada

  const esperasAno = (esperas || []).filter(e => {
    const d = e.partida?.Data
    return d && d >= dataIni && d <= dataHoje && e.partida?.IdPelada == idPelada
  })

  return (
    jogadasAno.length                                         * (c.PartidasJogadas  || 0) +
    esperasAno.length                                         * (c.PartidasAssistida || 0) +
    jogadasAno.filter(j => j.partida?.chuva).length          * (c.JogadasChuva     || 0) +
    esperasAno.filter(e => e.partida?.chuva).length          * (c.AssistidasChuva  || 0) +
    jogadasAno.filter(j => j.Resultado === 'Vitoria').length  * (c.Vitorias         || 0) +
    jogadasAno.filter(j => j.Resultado === 'Empate').length   * (c.Empates          || 0) +
    jogadasAno.filter(j => j.Resultado === 'Derrota').length  * (c.Derrotas         || 0) +
    jogadasAno.filter(j => j.CartaoAmarelo).length            * (c.Amarelo          || 0) +
    jogadasAno.filter(j => j.CartaoAzul).length               * (c.Azul             || 0) +
    jogadasAno.filter(j => j.CartaoVermelho).length           * (c.Vermelho         || 0)
  )
}

export function usePlayerProfile() {
  const supabase = useSupabaseClient()
  const { peladaAtual } = usePelada()

  const isProfileModalOpen = ref(false)
  const isProfileLoading = ref(false)
  const selectedProfile = ref(null)

  const openProfile = async (idJogador) => {
    if (!idJogador) return

    isProfileLoading.value = true
    isProfileModalOpen.value = true
    selectedProfile.value = null

    try {
      const today = new Date()
      const anoAtual = today.getFullYear()
      const dataIni = `${anoAtual}-01-01`
      const dataHoje = today.toISOString().split('T')[0]
      const idPelada = peladaAtual.value.id

      const [{ data: profile }, { data: criterios }, { data: jogadas }, { data: esperas }, { data: todasPartidas }] = await Promise.all([
        supabase.rpc('fn_perfil_jogador', {
          p_idjogador: idJogador,
          p_datainicial: dataIni,
          p_datafinal: dataHoje
        }).maybeSingle(),

        supabase.from('Pontuacao').select('*').eq('IdPelada', idPelada).maybeSingle(),

        supabase.from('JogadorPartida')
          .select('Resultado, CartaoAmarelo, CartaoAzul, CartaoVermelho, partida:idPartida(idPartida, Data, chuva)')
          .eq('IdParticipante', idJogador)
          .eq('IdPelada', idPelada),

        supabase.from('ListaEspera')
          .select('partida:IdPartida(idPartida, Data, chuva, IdPelada)')
          .eq('idParticipante', idJogador),

        supabase.from('Partida')
          .select('idPartida')
          .eq('IdPelada', idPelada)
          .gte('Data', dataIni)
          .lte('Data', dataHoje)
      ])

      if (profile && criterios) {
        const criteriosComId = { ...criterios, IdPelada: idPelada }
        const pontuacaoBase = calcularPontuacao(jogadas, esperas, criteriosComId, dataIni, dataHoje)

        // Calcular abono de faltas (2 primeiras faltas = +1 ponto cada)
        const jogadasIds = new Set((jogadas || [])
          .filter(j => j.partida?.Data >= dataIni && j.partida?.Data <= dataHoje)
          .map(j => j.partida?.idPartida))
        const esperasIds = new Set((esperas || [])
          .filter(e => e.partida?.Data >= dataIni && e.partida?.Data <= dataHoje && e.partida?.IdPelada == idPelada)
          .map(e => e.partida?.idPartida))
        const faltas = (todasPartidas || []).filter(p => !jogadasIds.has(p.idPartida) && !esperasIds.has(p.idPartida)).length
        const abono = Math.min(faltas, 2)

        selectedProfile.value = { ...profile, pontuacao: pontuacaoBase + abono }
      } else {
        selectedProfile.value = profile
      }
    } catch (err) {
      console.error('Falha ao carregar perfil:', err)
    } finally {
      isProfileLoading.value = false
    }
  }

  return { isProfileModalOpen, isProfileLoading, selectedProfile, openProfile }
}
