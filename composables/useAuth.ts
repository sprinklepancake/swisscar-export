export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const supabase = $supabase
  
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  
  const syncAuth = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        user.value = null
        return false
      }
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', sessionData.session.user.id)
        .single()
      
      if (error || !userData) {
        console.error('Error fetching user profile:', error)
        user.value = null
        return false
      }
      
      user.value = {
        ...userData,
        auth_uid: sessionData.session.user.id
      }
      
      return true
    } catch (error) {
      console.error('Auth sync error:', error)
      user.value = null
      return false
    }
  }
  
  if (process.client) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      if (event === 'SIGNED_IN') {
        await syncAuth()
      } else if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
    
    syncAuth()
  }
  
  return {
    user: readonly(user),
    isAuthenticated,
    
    async login(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          throw new Error(error.message || 'Login failed')
        }
        
        if (data.user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', data.user.id)
            .single()
          
          user.value = {
            ...profileData,
            auth_uid: data.user.id
          }
          
          await supabase
            .from('users')
            .update({ 
              last_login: new Date(),
              login_count: (profileData?.login_count || 0) + 1 
            })
            .eq('id', profileData.id)
          
          return true
        }
        
        return false
      } catch (error: any) {
        user.value = null
        throw error
      }
    },
    
    async register(userData: any) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              role: userData.role
            }
          }
        })
        
        if (authError) throw authError
        if (!authData.user) throw new Error('User creation failed')
        
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            email: userData.email,
            name: userData.name,
            phone: userData.phone.replace(/\D/g, ''),
            role: userData.role,
            company_name: userData.companyName,
            business_type: userData.businessType,
            tax_id: userData.taxId,
            street_address: userData.streetAddress,
            address: userData.streetAddress,
            canton: userData.canton,
            city: userData.city,
            zip_code: userData.zipCode,
            country: userData.country || 'Switzerland',
            auth_uid: authData.user.id,
            free_feature_credits: userData.role === 'seller' ? 1 : 0
          })
          .select()
          .single()
        
        if (profileError) {
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw profileError
        }
        
        user.value = {
          ...profileData,
          auth_uid: authData.user.id
        }
        
        return { user: user.value }
      } catch (error: any) {
        console.error('Registration error:', error)
        throw new Error(error.message || 'Registration failed')
      }
    },
    
    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        user.value = null
      } catch (error: any) {
        console.error('Logout error:', error)
        throw new Error(error.message || 'Logout failed')
      }
    },
    
    syncAuth
  }
}