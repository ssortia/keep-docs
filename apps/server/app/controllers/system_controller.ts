import { inject } from '@adonisjs/core'
import SystemInfoService from '#services/system_info_service'

@inject()
export default class SystemController {
  constructor(private systemInfoService: SystemInfoService) {}

  async info() {
    return this.systemInfoService.getSystemInfo()
  }
}
