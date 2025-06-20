import { Card, Timeline, Space, Typography } from 'antd';

const { Text } = Typography;

const ChangeHistoryCard: React.FC = () => {
  return (
    <Card title="История изменений">
      <Timeline
        items={[
          {
            color: 'green',
            children: (
              <Space direction="vertical" size={0}>
                <Text strong>Обновление системы безопасности</Text>
                <Text type="secondary">Внедрены новые алгоритмы шифрования</Text>
                <Text type="secondary">2024-01-15 14:30</Text>
              </Space>
            ),
          },
          {
            color: 'blue',
            children: (
              <Space direction="vertical" size={0}>
                <Text strong>Добавлен модуль аналитики</Text>
                <Text type="secondary">Реализована система отчетов</Text>
                <Text type="secondary">2024-01-12 09:15</Text>
              </Space>
            ),
          },
          {
            color: 'red',
            children: (
              <Space direction="vertical" size={0}>
                <Text strong>Исправлена критическая ошибка</Text>
                <Text type="secondary">Устранена проблема с авторизацией</Text>
                <Text type="secondary">2024-01-10 16:45</Text>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default ChangeHistoryCard;