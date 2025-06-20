import os from 'node:os'

export interface GitInfo {
  commit: string
  branch: string
  commitDate: string
}

export interface BuildInfo {
  buildTime: string
  version: string
  nodeVersion: string
}

export interface EnvironmentInfo {
  variables: Record<string, string | undefined>
  nodeEnv: string | undefined
  platform: string
  arch: string
  hostname: string
}

export interface SystemMetrics {
  uptime: {
    process: number
    system: number
  }
  memory: {
    total: number
    free: number
    used: number
    usagePercent: number
    process: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
  }
  cpu: {
    count: number
    model: string
    loadAverage: {
      '1min': number
      '5min': number
      '15min': number
    }
    loadPercent: number
  }
}

export interface SystemInfo {
  git: GitInfo
  build: BuildInfo
  environment: EnvironmentInfo
  system: SystemMetrics
  timestamp: string
}

export default class SystemInfoService {
  getGitInfo(): GitInfo {
    return {
      commit: process.env.GIT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
      commitDate: process.env.GIT_COMMIT_DATE || 'unknown',
    }
  }

  getBuildInfo(): BuildInfo {
    return {
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      nodeVersion: process.version,
    }
  }

  getEnvironmentInfo(): EnvironmentInfo {
    const safeEnvVars = {
      NODE_ENV: process.env.NODE_ENV,
      APP_NAME: process.env.APP_NAME,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      TZ: process.env.TZ,
      NODE_VERSION: process.version,
    }

    return {
      variables: safeEnvVars,
      nodeEnv: process.env.NODE_ENV,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
    }
  }

  getSystemMetrics(): SystemMetrics {
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsage = process.memoryUsage()
    const loadAverage = os.loadavg()
    const cpus = os.cpus()
    const cpuCount = cpus.length

    return {
      uptime: {
        process: Math.floor(process.uptime()),
        system: Math.floor(os.uptime()),
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
        process: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
      },
      cpu: {
        count: cpuCount,
        model: cpus[0]?.model || 'Unknown',
        loadAverage: {
          '1min': Math.round(loadAverage[0] * 100) / 100,
          '5min': Math.round(loadAverage[1] * 100) / 100,
          '15min': Math.round(loadAverage[2] * 100) / 100,
        },
        loadPercent: Math.min(Math.round((loadAverage[0] / cpuCount) * 100), 100),
      },
    }
  }

  getSystemInfo(): SystemInfo {
    return {
      git: this.getGitInfo(),
      build: this.getBuildInfo(),
      environment: this.getEnvironmentInfo(),
      system: this.getSystemMetrics(),
      timestamp: new Date().toISOString(),
    }
  }
}
