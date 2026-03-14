export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const supabase = useSupabaseClient()
    const isVisitor = useCookie('isVisitor')

    // Se não tem usuário no state, verifica diretamente no Supabase (ex: após reload)
    const hasSession = user.value
        ?? (await supabase.auth.getSession()).data.session

    // Se não tem sessão e NÃO é visitante, manda pro login
    if (!hasSession && !isVisitor.value && to.path !== '/login') {
        return navigateTo('/login')
    }

    // Se tem sessão E NÃO é visitante, não deixa acessar a tela de login
    // Visitante pode ir pro login para trocar para conta admin
    if (hasSession && !isVisitor.value && to.path === '/login') {
        return navigateTo('/')
    }
})
