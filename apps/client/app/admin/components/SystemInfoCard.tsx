import React from 'react';
import { Card, Descriptions, Progress, Tag, Typography, Space, Statistic, Row, Col, Tooltip, Button } from 'antd';
import { 
  ReloadOutlined, 
  DesktopOutlined, 
  DatabaseOutlined, 
  CloudServerOutlined,
  CodeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useSystemInfo } from '@/app/hooks/useSystemInfo';

const { Text, Title } = Typography;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
};

const getProgressColor = (percent: number): string => {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#52c41a';
};

const SystemInfoCard: React.FC = () => {
  const { systemInfo, loading, error, refresh } = useSystemInfo();

  if (error) {
    return (
      <Card title="Информация о системе">
        <Text type="danger">Ошибка загрузки системной информации: {error}</Text>
      </Card>
    );
  }

  if (!systemInfo && loading) {
    return (
      <Card title="Информация о системе" loading>
        Загрузка системной информации...
      </Card>
    );
  }
  console.log(systemInfo);
  if (!systemInfo) return null;

  return (
    <Card 
      title={
        <Space>
          <DesktopOutlined />
          <span>Информация о системе</span>
        </Space>
      }
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refresh} 
          loading={loading}
          size="small"
        >
          Обновить
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Git & Build Info */}
        <Col xs={24} lg={12}>
          <Card size="small" title={<Space><CodeOutlined />Git & Сборка</Space>}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Коммит">
                <Tag color="blue">{systemInfo.git?.commit}</Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {new Date(systemInfo.git?.commitDate).toLocaleDateString('ru-RU')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ветка">
                <Tag color="green">{systemInfo.git?.branch}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Версия">
                <Tag>{systemInfo.build.version}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Node.js">
                <Tag color="orange">{systemInfo.build.nodeVersion}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Environment Info */}
        <Col xs={24} lg={12}>
          <Card size="small" title={<Space><EnvironmentOutlined />Окружение</Space>}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Среда">
                <Tag color={systemInfo.environment.nodeEnv === 'production' ? 'red' : 'blue'}>
                  {systemInfo.environment.nodeEnv}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Платформа">
                <Text>{systemInfo.environment.platform} ({systemInfo.environment.arch})</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Хост">
                <Text code>{systemInfo.environment.hostname}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Порт">
                <Text code>{systemInfo.environment.variables.PORT || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* System Resources */}
        <Col xs={24}>
          <Card size="small" title={<Space><CloudServerOutlined />Ресурсы системы</Space>}>
            <Row gutter={[16, 16]}>
              {/* Memory Usage */}
              <Col xs={24} md={12}>
                <Title level={5}>
                  <DatabaseOutlined /> Память
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="Использовано" 
                        value={formatBytes(systemInfo.system.memory.used)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Всего" 
                        value={formatBytes(systemInfo.system.memory.total)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                  <Progress 
                    percent={systemInfo.system.memory.usagePercent}
                    strokeColor={getProgressColor(systemInfo.system.memory.usagePercent)}
                    status={systemInfo.system.memory.usagePercent >= 90 ? 'exception' : 'normal'}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Процесс: {formatBytes(systemInfo.system.memory.process.heapUsed)} / {formatBytes(systemInfo.system.memory.process.heapTotal)}
                  </Text>
                </Space>
              </Col>

              {/* CPU Usage */}
              <Col xs={24} md={12}>
                <Title level={5}>
                  <DesktopOutlined /> CPU
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="Ядер" 
                        value={systemInfo.system.cpu.count}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Загрузка 1м" 
                        value={`${systemInfo.system.cpu.loadPercent}%`}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                  <Progress 
                    percent={systemInfo.system.cpu.loadPercent}
                    strokeColor={getProgressColor(systemInfo.system.cpu.loadPercent)}
                    status={systemInfo.system.cpu.loadPercent >= 90 ? 'exception' : 'normal'}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Load Average: {systemInfo.system.cpu.loadAverage['1min']} / {systemInfo.system.cpu.loadAverage['5min']} / {systemInfo.system.cpu.loadAverage['15min']}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                    {systemInfo.system.cpu.model}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Uptime */}
        <Col xs={24}>
          <Card size="small" title={<Space><ClockCircleOutlined />Время работы</Space>}>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Statistic 
                  title="Процесс" 
                  value={formatUptime(systemInfo.system.uptime.process)}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title="Система" 
                  value={formatUptime(systemInfo.system.uptime.system)}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Последнее обновление: {new Date(systemInfo.timestamp).toLocaleString('ru-RU')}
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Environment Variables */}
        <Col xs={24}>
          <Card size="small" title="Переменные окружения">
            <Row gutter={[8, 8]}>
              {Object.entries(systemInfo.environment.variables).map(([key, value]) => (
                <Col key={key} xs={24} sm={12} md={8}>
                  <Tooltip title={value || 'Не установлено'}>
                    <Space>
                      <Tag color="default">{key}</Tag>
                      <Text code style={{ fontSize: '11px' }}>
                        {value || 'N/A'}
                      </Text>
                    </Space>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default SystemInfoCard;