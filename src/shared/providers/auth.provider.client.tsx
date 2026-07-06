'use client'

import type { User } from '@/payload-types'

import React, { createContext, useContext, useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void>

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void>

type Login = (args: { email: string; password: string }) => Promise<User>

type Logout = () => Promise<void>

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
}

const Context = createContext({} as AuthContext)

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

const jsonInit = (body?: unknown): RequestInit => ({
  body: body ? JSON.stringify(body) : undefined,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})

const postFetcher = async <T,>(url: string, { arg }: { arg?: unknown }): Promise<T> => {
  const res = await fetch(url, jsonInit(arg))
  if (!res.ok) throw new Error('Invalid login')
  return res.json()
}

const meFetcher = async (url: string): Promise<{ user?: User | null }> => {
  const res = await fetch(url, { credentials: 'include', method: 'GET' })
  if (!res.ok) throw new Error('An error occurred while fetching your account.')
  return res.json()
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>()
  // tracks the single event of logging in or logging out
  const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | undefined>()

  useSWR(`${SERVER_URL}/api/users/me`, meFetcher, {
    onError: () => setUser(null),
    onSuccess: ({ user: meUser }) => {
      setUser(meUser || null)
      setStatus(meUser ? 'loggedIn' : undefined)
    },
    revalidateOnFocus: false,
  })

  const { trigger: triggerCreate } = useSWRMutation(
    `${SERVER_URL}/api/users/create`,
    postFetcher<{ data?: { loginUser?: { user?: User } }; errors?: { message: string }[] }>,
  )
  const { trigger: triggerLogin } = useSWRMutation(
    `${SERVER_URL}/api/users/login`,
    postFetcher<{ errors?: { message: string }[]; user?: User }>,
  )
  const { trigger: triggerLogout } = useSWRMutation(
    `${SERVER_URL}/api/users/logout`,
    postFetcher<unknown>,
  )
  const { trigger: triggerForgot } = useSWRMutation(
    `${SERVER_URL}/api/users/forgot-password`,
    postFetcher<{ data?: { loginUser?: { user?: User } }; errors?: { message: string }[] }>,
  )
  const { trigger: triggerReset } = useSWRMutation(
    `${SERVER_URL}/api/users/reset-password`,
    postFetcher<{ data?: { loginUser?: { user?: User } }; errors?: { message: string }[] }>,
  )

  const create: Create = async (args) => {
    try {
      const { data, errors } = await triggerCreate({
        email: args.email,
        password: args.password,
        passwordConfirm: args.passwordConfirm,
      })
      if (errors) throw new Error(errors[0].message)
      setUser(data?.loginUser?.user)
      setStatus('loggedIn')
    } catch {
      throw new Error('An error occurred while attempting to login.')
    }
  }

  const login: Login = async (args) => {
    try {
      const { errors, user: loggedInUser } = await triggerLogin({
        email: args.email,
        password: args.password,
      })
      if (errors) throw new Error(errors[0].message)
      setUser(loggedInUser)
      setStatus('loggedIn')
      return loggedInUser as User
    } catch {
      throw new Error('An error occurred while attempting to login.')
    }
  }

  const logout: Logout = async () => {
    try {
      await triggerLogout()
      setUser(null)
      setStatus('loggedOut')
    } catch {
      throw new Error('An error occurred while attempting to logout.')
    }
  }

  const forgotPassword: ForgotPassword = async (args) => {
    try {
      const { data, errors } = await triggerForgot({ email: args.email })
      if (errors) throw new Error(errors[0].message)
      setUser(data?.loginUser?.user)
    } catch {
      throw new Error('An error occurred while attempting to login.')
    }
  }

  const resetPassword: ResetPassword = async (args) => {
    try {
      const { data, errors } = await triggerReset({
        password: args.password,
        passwordConfirm: args.passwordConfirm,
        token: args.token,
      })
      if (errors) throw new Error(errors[0].message)
      setUser(data?.loginUser?.user)
      setStatus(data?.loginUser?.user ? 'loggedIn' : undefined)
    } catch {
      throw new Error('An error occurred while attempting to login.')
    }
  }

  return (
    <Context.Provider
      value={{
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        status,
        user,
      }}
    >
      {children}
    </Context.Provider>
  )
}

type UseAuth = () => AuthContext

export const useAuth: UseAuth = () => useContext(Context)
