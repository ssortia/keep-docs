import { BusinessException } from '#exceptions/business_exceptions'

/**
 * User blocked exception
 */
export class UserBlockedException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('Ваш аккаунт заблокирован. Обратитесь к администратору', options)
  }

  readonly code = 'E_USER_BLOCKED'
  readonly status = 403
}

/**
 * Email not verified exception
 */
export class EmailNotVerifiedException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('Пожалуйста, подтвердите ваш email адрес перед входом в систему', options)
  }

  readonly code = 'E_EMAIL_NOT_VERIFIED'
  readonly status = 403
}

/**
 * Email already exists exception
 */
export class EmailExistsException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('Пользователь с таким email уже существует', options)
  }

  readonly code = 'E_EMAIL_EXISTS'
  readonly status = 409
}

/**
 * User not found exception
 */
export class UserNotFoundException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('Пользователь не найден', options)
  }

  readonly code = 'E_USER_NOT_FOUND'
  readonly status = 404
}

/**
 * Invalid credentials exception
 */
export class InvalidCredentialsException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('Неверные учетные данные', options)
  }

  readonly code = 'E_INVALID_CREDENTIALS'
  readonly status = 400
}

/**
 * OAuth authentication exception
 */
export class OAuthException extends BusinessException {
  constructor(message: string = 'Ошибка OAuth аутентификации', options?: ErrorOptions) {
    super(message, options)
  }

  readonly code = 'E_OAUTH_ERROR'
  readonly status = 400
}

/**
 * User has no role exception
 */
export class UserNoRoleException extends BusinessException {
  constructor(options?: ErrorOptions) {
    super('У пользователя отсутствует роль', options)
  }

  readonly code = 'E_USER_NO_ROLE'
  readonly status = 403
}
