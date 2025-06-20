import User from '#models/user'

export async function createAuthToken(user: User): Promise<string> {
  const token = await User.accessTokens.create(user)
  return token.value!.release()
}