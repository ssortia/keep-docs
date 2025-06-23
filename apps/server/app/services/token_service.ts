import User from '#models/user'
import ApiClient from '#models/api_client'

export class TokenService {
  async generateAccessToken(user: User): Promise<string> {
    const token = await User.accessTokens.create(user)
    return token.value!.release()
  }

  async generateSchemaAccessToken(
    user: User,
    clientId: number,
    schemas?: string[]
  ): Promise<string> {
    const client = await ApiClient.findOrFail(clientId)

    if (!client.active) {
      throw new Error('API клиент деактивирован')
    }

    // Используем схемы клиента или переданные схемы
    const allowedSchemas = schemas || client.allowedSchemas

    // Проверяем, что все переданные схемы разрешены для клиента
    if (schemas) {
      const unauthorizedSchemas = schemas.filter((schema) => !client.hasSchemaAccess(schema))
      if (unauthorizedSchemas.length > 0) {
        throw new Error(`Нет доступа к схемам: ${unauthorizedSchemas.join(', ')}`)
      }
    }

    const abilities = allowedSchemas.map((schema) => `schema:${schema}`)

    // Создаем бессрочный токен (без expiresAt)
    const token = await User.accessTokens.create(user, abilities, {
      name: `api_client_${client.name}`,
    })

    return token.value!.release()
  }

  async revokeAllUserTokens(user: User): Promise<void> {
    const tokens = await User.accessTokens.all(user)
    await Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))
  }

  async revokeTokensByClient(user: User, clientName: string): Promise<void> {
    const tokens = await User.accessTokens.all(user)
    const clientTokens = tokens.filter((token) => token.name === `api_client_${clientName}`)
    await Promise.all(clientTokens.map((token) => User.accessTokens.delete(user, token.identifier)))
  }
}
