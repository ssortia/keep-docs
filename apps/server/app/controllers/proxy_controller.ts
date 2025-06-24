import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import FormData from 'form-data'

import { createReadStream } from 'fs'

export default class ProxyController {
  private readonly TARGET_BASE_URL = 'http://localhost:3333/api/docs'

  async proxy({ request, response }: HttpContext) {
    console.log('test')
    try {
      const targetPath = request.param('*')
      const targetUrl = `${this.TARGET_BASE_URL}/${targetPath.join('/')}`

      const headers: Record<string, string> = {
        Authorization: `Bearer oat_OA.QkJXZzFxbDU5MFd4cXdEQ1FocHVlaC1RcE9JN183a0NENnJyRG45MTMzOTg3MDk0MjE`,
      }

      // Обрабатываем разные типы запросов
      let responseData

      if (request.method() === 'GET') {
        // Добавляем query параметры для GET запросов
        const queryParams = request.qs()

        const axiosResponse = await axios.get(targetUrl, {
          headers,
          params: queryParams,
          responseType: request.header('accept')?.includes('application/json')
            ? 'json'
            : 'arraybuffer',
        })

        // Если это бинарные данные (blob)
        if (
          axiosResponse.headers['content-type']?.includes('application/') &&
          !axiosResponse.headers['content-type']?.includes('json')
        ) {
          response.header('content-type', axiosResponse.headers['content-type'])
          return response.send(axiosResponse.data)
        }

        responseData = axiosResponse.data
      } else if (
        request.method() === 'PUT' &&
        request.header('content-type')?.includes('multipart/form-data')
      ) {
        // Обработка multipart/form-data для PUT запросов
        const formData = new FormData()

        // Получаем все поля из мультипарт формы
        const body = request.all()
        const files = request.allFiles()

        // Добавляем обычные поля
        Object.keys(body).forEach((key) => {
          if (body[key] !== undefined && body[key] !== null) {
            formData.append(key, body[key])
          }
        })

        // Добавляем файлы
        Object.keys(files).forEach((key) => {
          const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]]
          fileArray.forEach((file) => {
            if (file && file.tmpPath) {
              formData.append(key, createReadStream(file.tmpPath), {
                filename: file.clientName,
                contentType: file.headers['content-type'],
              })
            }
          })
        })

        // Добавляем заголовки формы к основным заголовкам
        Object.assign(headers, formData.getHeaders())

        const axiosResponse = await axios.put(targetUrl, formData, { headers })
        responseData = axiosResponse.data
      } else if (['POST', 'PUT', 'PATCH'].includes(request.method())) {
        // Обработка JSON запросов
        headers['Content-Type'] = 'application/json'

        const axiosResponse = await axios({
          method: request.method().toLowerCase(),
          url: targetUrl,
          headers,
          data: request.body(),
        })

        responseData = axiosResponse.data
      } else if (request.method() === 'DELETE') {
        const axiosResponse = await axios.delete(targetUrl, { headers })
        responseData = axiosResponse.data
      }

      return response.json(responseData)
    } catch (error) {
      console.error('Proxy error:', error)

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500
        const message = error.response?.data || error.message
        return response.status(status).json({ error: message })
      }

      return response.internalServerError({ error: 'Proxy request failed' })
    }
  }
}
