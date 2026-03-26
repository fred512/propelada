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

      const [{ data: profile }, { data: criterios }, { data: jogadas }, { data: esperas }] = await Promise.all([
        supabase.rpc('fn_perfil_jogador', {
          p_idjogador: idJogador,
          p_datainicial: dataIni,
          p_datafinal: dataHoje
        }).maybeSingle(),

        supabase.from('Pontuacao').select('*').eq('IdPelada', idPelada).maybeSingle(),

        supabase.from('JogadorPartida')
          .select('Resultado, CartaoAmarelo, CartaoAzul, CartaoVermelho, partida:idPartida(Data, chuva)')
          .eq('IdParticipante', idJogador)
          .eq('IdPelada', idPelada),

        supabase.from('ListaEspera')
          .select('partida:IdPartida(Data, chuva, IdPelada)')
          .eq('idParticipante', idJogador)
      ])

      if (profile && criterios) {
        const pontuacaoCalculada = calcularPontuacao(jogadas, esperas, { ...criterios, IdPelada: idPelada }, dataIni, dataHoje)
        selectedProfile.value = { ...profile, pontuacao: pontuacaoCalculada }
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
