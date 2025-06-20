import { Card, List, Avatar, Space, Tag, Typography, Button } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatusItem {
  title: string;
  status: 'online' | 'warning' | 'offline';
  uptime: string;
}

const SystemStatusCard: React.FC = () => {
  const systemStatus: StatusItem[] = [
    { title: 'База данных', status: 'online', uptime: '99.9%' },
    { title: 'API сервер', status: 'online', uptime: '99.8%' },
    { title: 'Кеш Redis', status: 'online', uptime: '100%' },
    { title: 'Файловое хранилище', status: 'warning', uptime: '95.2%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'green';
      case 'warning':
        return 'orange';
      case 'offline':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleOutlined />;
      case 'warning':
        return <ExclamationCircleOutlined />;
      case 'offline':
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <Card title="Состояние системы" extra={<Button type="link">Мониторинг</Button>}>
      <List
        dataSource={systemStatus}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={getStatusIcon(item.status)}
                  style={{ backgroundColor: getStatusColor(item.status) }}
                />
              }
              title={
                <Space>
                  <Text strong>{item.title}</Text>
                  <Tag color={getStatusColor(item.status)}>
                    {item.status === 'online'
                      ? 'Онлайн'
                      : item.status === 'warning'
                        ? 'Предупреждение'
                        : 'Офлайн'}
                  </Tag>
                </Space>
              }
              description={<Text type="secondary">Время работы: {item.uptime}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SystemStatusCard;