import { useState } from 'react'
import { useAuthStore } from '../context/store'

export const useAuth = () => {
  const { user, token } = useAuthStore()
  const storedToken = localStorage.getItem('access_token')
  const storedUser = localStorage.getItem('user')

  return {
    isAuthenticated: Boolean(token || storedToken),
    user: user || (storedUser ? JSON.parse(storedUser) : null),
    token: token || storedToken,
  }
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
