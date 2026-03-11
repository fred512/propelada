export const usePelada = () => {
  const peladaAtual = useState('peladaAtual', () => ({
    id: null,
    nome: 'Nenhuma Pelada',
    responsavel: 'Desconhecido',
    dia: '',
    horario: '',
    exibeEstatistica: false
  }))

  const isVisitor = useCookie('isVisitor', { default: () => false, path: '/', maxAge: 60 * 60 * 24 * 7 })

  const nomeFormatado = computed(() => {
    if (!peladaAtual.value?.id) return 'Selecione uma Pelada'
    const { nome, dia, horario } = peladaAtual.value
    return `${nome} - ${dia} - ${horario}`
  })

  // Define uma pelada específica como ativa
  const setPelada = (data) => {
    if (!data) return
    peladaAtual.value = {
      id: data.idPelada || data.id,
      nome: data.NomePelada || data.nome,
      responsavel: data.Responsavel || data.responsavel,
      dia: data.Dia || data.dia || '',
      horario: data.Horario || data.horario || '',
      exibeEstatistica: data.ExibeEstatistica ?? data.exibeEstatistica ?? false
    }
  }

  // Busca a última pelada do administrador
  const fetchPelada = async (idUser) => {
    if (!idUser) return

    // Visitante padrão
    if (idUser === 'VISITOR_ID' || isVisitor.value) {
      return
    }

    const supabase = useSupabaseClient()
    try {
      const { data, error } = await supabase
        .from('Pelada')
        .select('idPelada, NomePelada, Responsavel, Dia, Horario, ExibeEstatistica')
        .eq('idUser', idUser)
        .order('idPelada', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setPelada(data)
      }
    } catch (e) {
      console.error('fetchPelada: Erro inesperado:', e)
    }
  }

  // Busca todas as peladas (para o seletor de visitante)
  const fetchAllPeladas = async () => {
    const supabase = useSupabaseClient()
    try {
      const { data, error } = await supabase
        .from('Pelada')
        .select('idPelada, NomePelada, Responsavel, Dia, Horario, ExibeEstatistica')
        .order('NomePelada', { ascending: true })

      if (error) throw error
      return data || []
    } catch (e) {
      console.error('fetchAllPeladas: Erro:', e)
      return []
    }
  }

  const canViewEstatisticas = computed(() => {
    if (!isVisitor.value) return true
    const rawValue = peladaAtual.value?.exibeEstatistica ?? peladaAtual.value?.ExibeEstatistica
    if (rawValue == null) return false
    const strVal = String(rawValue).toLowerCase().trim()
    return strVal === 'true' || strVal === '1' || rawValue === true || rawValue === 1
  })

  // Limpar os dados da pelada atual
  const clearPelada = () => {
    peladaAtual.value = {
      id: null,
      nome: 'Nenhuma Pelada',
      responsavel: 'Desconhecido',
      dia: '',
      horario: '',
      exibeEstatistica: false
    }
  }

  return {
    peladaAtual,
    isVisitor,
    nomeFormatado,
    canViewEstatisticas,
    setPelada,
    clearPelada,
    fetchPelada,
    fetchAllPeladas
  }
}

