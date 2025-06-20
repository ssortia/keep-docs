import User from '#models/user'

export class TokenService {
  async generateAccessToken(user: User): Promise<string> {
    const token = await User.accessTokens.create(user)
    return token.value!.release()
  }

  async revokeAllUserTokens(user: User): Promise<void> {
    const tokens = await User.accessTokens.all(user)
    await Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))
  }
}
