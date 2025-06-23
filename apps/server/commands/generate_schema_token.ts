import { args, BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import ApiClient from '#models/api_client'
import { TokenService } from '#services/token_service'

export default class GenerateSchemaToken extends BaseCommand {
  static commandName = 'generate:schema-token'
  static description = 'Генерирует бессрочный токен для доступа к указанным схемам'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  @args.string({ description: 'Email пользователя' })
  declare userEmail: string

  @args.string({ description: 'Название API клиента' })
  declare clientName: string

  @flags.array({ description: 'Список схем для доступа (через запятую)', alias: 's' })
  declare schemas: string[]

  @flags.string({ description: 'Описание API клиента', alias: 'd' })
  declare description?: string

  @flags.boolean({ description: 'Создать нового API клиента если не существует', alias: 'c' })
  declare createClient: boolean

  async run() {
    const tokenService = new TokenService()

    try {
      // Находим или создаем пользователя
      let user = await User.findBy('email', this.userEmail)

      if (!user) {
        const fullName = this.userEmail.split('@')[0]
        const password = Math.random().toString(36).slice(-12)

        user = await User.create({
          email: this.userEmail,
          fullName,
          password,
          isEmailVerified: true,
        })

        this.logger.success(`Создан новый пользователь: ${user.email}`)
        this.logger.info(`Сгенерированный пароль: ${password}`)
      } else {
        this.logger.info(`Найден пользователь: ${user.email}`)
      }
      // Находим или создаем API клиента
      let client = await ApiClient.query()
        .where('name', this.clientName)
        .where('createdBy', user.id)
        .first()

      if (!client) {
        if (this.createClient) {
          if (!this.schemas || this.schemas.length === 0) {
            this.logger.error(
              'Для создания нового клиента необходимо указать схемы через --schemas'
            )
            return
          }

          client = await ApiClient.create({
            name: this.clientName,
            description: this.description || `API клиент ${this.clientName}`,
            allowedSchemas: this.schemas,
            createdBy: user.id,
            active: true,
          })

          this.logger.success(`Создан новый API клиент: ${client.name}`)
        } else {
          this.logger.error(
            `API клиент '${this.clientName}' не найден. Используйте флаг --create-client для создания`
          )
          return
        }
      }

      if (!client.active) {
        this.logger.error(`API клиент '${this.clientName}' деактивирован`)
        return
      }

      // Генерируем токен
      const token = await tokenService.generateSchemaAccessToken(user, client.id, this.schemas)

      // Выводим информацию
      this.logger.success('Токен успешно сгенерирован!')
      this.logger.info('')
      this.logger.info('🔑 ТОКЕН:')
      this.logger.info(`${token}`)
      this.logger.info('')
      this.logger.info('📋 ИНФОРМАЦИЯ:')
      this.logger.info(`Пользователь: ${user.email}`)
      this.logger.info(`API клиент: ${client.name}`)
      this.logger.info(`Доступные схемы: ${this.schemas || client.allowedSchemas}`)
      this.logger.info(`Срок действия: бессрочный`)
      this.logger.info('')
      this.logger.info('💡 ИСПОЛЬЗОВАНИЕ:')
      this.logger.info(`Bearer токен: ${token}`)
    } catch (error) {
      console.log(error)
      this.logger.error(`Ошибка: ${error.message}`)
    }
  }
}
