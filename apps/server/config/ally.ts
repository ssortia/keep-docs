import { defineConfig, services } from '@adonisjs/ally'

export default defineConfig({
  github: services.github({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackUrl: 'http://localhost:3333/api/auth/github/callback',
  }),
})
