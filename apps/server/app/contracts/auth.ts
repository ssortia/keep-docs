import User from '#models/user'

export interface AuthenticationResult {
  user: User
  token: string
}

export interface AuthenticationCredentials {
  email: string
  password: string
}

export interface RegistrationData {
  fullName: string
  email: string
  password: string
}

export interface OAuthUserData {
  id: string
  name?: string
  nickName?: string
  email: string
  provider: string
}

export interface AuthProvider {
  authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationResult>
  register(data: RegistrationData): Promise<User>
  getUserPermissions(user: User): Promise<{ role: string; permissions: string[] }>
}

export interface OAuthProvider {
  handleCallback(context: any): Promise<AuthenticationResult>
  getRedirectUrl(context: any): Promise<void>
}

export enum AuthProviderType {
  LOCAL = 'local',
  GITHUB = 'github',
}
