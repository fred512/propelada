import { ref } from 'vue'

/**
 * Calcula pontos de presença/ausência com lógica de abono.
 *
 * Regras:
 * - Jogou (in JogadorPartida): +ptJogou
 * - Não jogou, abonos usados < 2: +ptJogou (abono, independente de ListaEspera)
 * - Não jogou, abonos usados >= 2, in ListaEspera: +ptAssistiu
 * - Não jogou, abonos usados >= 2, não in ListaEspera: 0
 *
 * @param {Array}  todasPartidas  - partidas do período ordenadas por Data asc [{idPartida, Data}]
 * @param {Set}    jogadasIds     - IDs das partidas que jogou
 * @param {Set}    esperasIds     - IDs das partidas que estava na ListaEspera
 * @param {number} ptJogou        - pontos por presença/abono (ex: 4)
 * @param {number} ptAssistiu     - pontos por assistência pós-abono (ex: 2)
 * @returns {{ pontos: number, abonos: number }}
 */
export function calcularPresencaAbono(todasPartidas, jogadasIds, esperasIds, ptJogou, ptAssistiu) {
  const sorted = [...(todasPartidas || [])].sort((a, b) =>
    (a.Data || '').localeCompare(b.Data || '')
  )
  let pontos = 0
  let ausencias = 0
  let abonos = 0

  for (const p of sorted) {
    const id = p.idPartida
    if (jogadasIds.has(id)) {
      pontos += ptJogou
    } else {
      if (ausencias < 2) {
        pontos += ptJogou  // abono
        abonos++
      } else if (esperasIds.has(id)) {
        pontos += ptAssistiu
      }
      ausencias++
    }
  }

  return { pontos, abonos }
}

/**
 * Calcula pontos de resultado, cartões e chuva (sem presença — use calcularPresencaAbono para isso).
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
    jogadasAno.filter(j => j.partida?.chuva).length          * (c.JogadasChuva  || 0) +
    esperasAno.filter(e => e.partida?.chuva).length           * (c.AssistidasChuva || 0) +
    jogadasAno.filter(j => j.Resultado === 'Vitoria').length  * (c.Vitorias      || 0) +
    jogadasAno.filter(j => j.Resultado === 'Empate').length   * (c.Empates       || 0) +
    jogadasAno.filter(j => j.Resultado === 'Derrota').length  * (c.Derrotas      || 0) +
    jogadasAno.filter(j => j.CartaoAmarelo).length            * (c.Amarelo       || 0) +
    jogadasAno.filter(j => j.CartaoAzul).length               * (c.Azul          || 0) +
    jogadasAno.filter(j => j.CartaoVermelho).length           * (c.Vermelho      || 0)
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
      const dataHoje = new Date().toISOString().split('T')[0]
      const idPelada = peladaAtual.value.id

      const { data: pelada } = await supabase
        .from('Pelada')
        .select('DataInicial, DataFinal')
        .eq('idPelada', idPelada)
        .maybeSingle()

      const dataIni = pelada?.DataInicial || `${new Date().getFullYear()}-01-01`
      const dataFim = pelada?.DataFinal || dataHoje

      const [{ data: profile }, { data: criterios }, { data: jogadas }, { data: esperas }, { data: todasPartidas }] = await Promise.all([
        supabase.rpc('fn_perfil_jogador', {
          p_idjogador: idJogador,
          p_datainicial: dataIni,
          p_datafinal: dataFim
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
          .select('idPartida, Data')
          .eq('IdPelada', idPelada)
          .gte('Data', dataIni)
          .lte('Data', dataFim)
      ])

      if (profile && criterios) {
        const criteriosComId = { ...criterios, IdPelada: idPelada }

        const jogadasIds = new Set((jogadas || [])
          .filter(j => j.partida?.Data >= dataIni && j.partida?.Data <= dataFim)
          .map(j => j.partida?.idPartida))

        const esperasIds = new Set((esperas || [])
          .filter(e => e.partida?.Data >= dataIni && e.partida?.Data <= dataFim && e.partida?.IdPelada == idPelada)
          .map(e => e.partida?.idPartida))

        const ptJogou    = criterios.PartidasJogadas  ?? 4
        const ptAssistiu = criterios.PartidasAssistida ?? 2

        const { pontos: ptPresenca, abonos } = calcularPresencaAbono(
          todasPartidas, jogadasIds, esperasIds, ptJogou, ptAssistiu
        )

        const outrosPontos = calcularPontuacao(jogadas, esperas, criteriosComId, dataIni, dataFim)

        selectedProfile.value = {
          ...profile,
          pontuacao: ptPresenca + outrosPontos,
          abono_faltas: abonos,
          qtd_participacoes: jogadasIds.size,
          qtd_esperas: esperasIds.size
        }
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
