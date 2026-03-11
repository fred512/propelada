export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()
    const isVisitor = useCookie('isVisitor')

    // Se não tem usuário logado e NÃO é visitante, manda pro login
    if (!user.value && !isVisitor.value && to.path !== '/login') {
        return navigateTo('/login')
    }

    // Se tem usuário logado (Admin), não deixa acessar a tela de login
    if (user.value && to.path === '/login') {
        return navigateTo('/')
    }
})
