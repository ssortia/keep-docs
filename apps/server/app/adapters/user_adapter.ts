import User from '#models/user'

export interface UserResponse {
  id: number
  email: string
  fullName: string
  blocked: boolean
  isEmailVerified?: boolean
  role: any
}

export class UserAdapter {
  formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      blocked: user.blocked,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    }
  }
}
