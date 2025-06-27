import { Card, Col, Row, Typography } from 'antd';
import { SafetyOutlined, SettingOutlined, StockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Text } = Typography;

const QuickActionsCard: React.FC = () => {
  return (
    <Card title="Быстрые действия">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Link href="/users" style={{ textDecoration: 'none' }}>
            <Card size="small" hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div>
                <Text strong>Пользователи</Text>
                <br />
                <Text type="secondary">Управление пользователями</Text>
              </div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link href="/dictionaries/roles" style={{ textDecoration: 'none' }}>
            <Card size="small" hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
              <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div>
                <Text strong>Роли</Text>
                <br />
                <Text type="secondary">Настройка ролей</Text>
              </div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link href="/admin/audit" style={{ textDecoration: 'none' }}>
            <Card size="small" hoverable style={{ textAlign: 'center' }}>
              <StockOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <div>
                <Text strong>Аудит</Text>
                <br />
                <Text type="secondary">Мониторинг и логи</Text>
              </div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <a href="http://localhost:3333/docs" target="_blank">
            <Card size="small" hoverable style={{ textAlign: 'center' }}>
              <SettingOutlined
                style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }}
              />
              <div>
                <Text strong>Swagger</Text>
                <br />
                <Text type="secondary">Документация API</Text>
              </div>
            </Card>
          </a>
        </Col>
      </Row>
    </Card>
  );
};

export default QuickActionsCard;
