import { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth_validator'
import { AuthService } from '#services/auth_service'
import { inject } from '@adonisjs/core'
import { UserAdapter } from '#adapters/user_adapter'

@inject()
export default class AuthController {
  constructor(
    private authService: AuthService,
    private userAdapter: UserAdapter
  ) {}

  /**
   * @register
   * @tag Auth
   * @summary Регистрация нового пользователя
   * @description Создает нового пользователя с отправкой письма подтверждения
   * @requestBody {"fullName": "John Doe", "email": "john@example.com", "password": "password123", "passwordConfirmation": "password123"}
   * @responseBody 201 - {"message": "Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.", "user": {"id": 1, "email": "john@example.com", "fullName": "John Doe", "blocked": false, "isEmailVerified": false, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}}}
   * @responseBody 409 - {"message": "Пользователь с таким email уже существует"}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The email field must be a valid email address", "rule": "email", "field": "email"}]}
   */
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await this.authService.register(data.fullName, data.email, data.password)

    return {
      message: 'Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.',
      user: this.userAdapter.formatUserResponse(user),
    }
  }

  /**
   * @login
   * @tag Auth
   * @summary Вход пользователя в систему
   * @description Аутентифицирует пользователя по email и паролю, возвращает токен доступа
   * @requestBody {"email": "john@example.com", "password": "password123"}
   * @responseBody 200 - {"user": {"id": 1, "email": "john@example.com", "fullName": "John Doe", "blocked": false, "isEmailVerified": true, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}}, "token": "oat_MjI.abc123xyz..."}
   * @responseBody 403 - {"message": "Ваш аккаунт заблокирован. Обратитесь к администратору"}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The email field must be a valid email address", "rule": "email", "field": "email"}]}
   * @responseBody 400 - {"message": "Invalid credentials"}
   */
  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const { user, token } = await this.authService.login(email, password)

    return {
      user: this.userAdapter.formatUserResponse(user),
      token,
    }
  }

  /**
   * @logout
   * @tag Auth
   * @summary Выход пользователя из систем
   * @description Деактивирует текущий токен доступа
   * @security BearerAuth
   * @responseBody 204 - ""
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.use('api').user!

    await this.authService.logout(user)

    return response.noContent()
  }

  /**
   * @me
   * @tag Auth
   * @summary Получение информации о текущем пользователе
   * @description Возвращает информацию о текущем аутентифицированном пользователе с ролью
   * @security BearerAuth
   * @responseBody 200 - {"user": {"id": 1, "email": "john@example.com", "fullName": "John Doe", "blocked": false, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}}}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Ваш аккаунт заблокирован. Обратитесь к администратору"}
   */
  async me({ auth }: HttpContext) {
    const user = auth.use('api').user!
    await user.load('role')

    return { user: this.userAdapter.formatUserResponse(user) }
  }

  /**
   * @permissions
   * @tag Auth
   * @summary Получение прав пользователя
   * @description Возвращает роль и список всех разрешений текущего пользователя
   * @security BearerAuth
   * @responseBody 200 - {"role": "admin", "permissions": ["users.view", "users.create", "users.edit", "users.delete", "roles.view"]}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "У пользователя отсутствует роль"}
   */
  async permissions({ auth }: HttpContext) {
    const user = auth.use('api').user!
    return this.authService.getUserPermissions(user)
  }
}
