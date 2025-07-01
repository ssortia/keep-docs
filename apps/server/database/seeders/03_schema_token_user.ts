import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import ApiClient from '#models/api_client'
import { TokenService } from '#services/token_service'
import fs from 'node:fs'
import path from 'node:path'

export default class SchemaTokenUserSeeder extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const tokenService = new TokenService()
    const userEmail = 'testuser'
    const clientName = 'testuser'
    const schemas = ['example']

    // Создаем пользователя
    const user = await User.create({
      email: userEmail,
      fullName: userEmail,
      password: Math.random().toString(36).slice(-12),
      isEmailVerified: true,
    })

    // Создаем API клиента
    const client = await ApiClient.create({
      name: clientName,
      description: `API клиент ${clientName}`,
      allowedSchemas: schemas,
      createdBy: user.id,
      active: true,
    })

    // Генерируем токен
    const token = await tokenService.generateSchemaAccessToken(user, client.id, schemas)

    // Записываем токен в .env файлы
    const envPath = path.join(process.cwd(), '.env')

    // Обновляем .env
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8')
      if (envContent.includes('PROXY_BEARER=')) {
        envContent = envContent.replace(/PROXY_BEARER=.*/, `PROXY_BEARER=${token}`)
      } else {
        envContent += `\nPROXY_BEARER=${token}`
      }
      fs.writeFileSync(envPath, envContent)
    }

    console.log('🔑 ТОКЕН:', token)
    console.log('📋 Пользователь:', user.email)
    console.log('📋 API клиент:', client.name)
    console.log('📋 Доступные схемы:', schemas)
    console.log('✅ Токен записан в .env и .env.test')
  }
}
