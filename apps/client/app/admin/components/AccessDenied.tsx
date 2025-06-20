import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const AccessDenied: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Title level={1} style={{ fontSize: '96px', margin: 0, color: '#ff4d4f' }}>
        403
      </Title>
      <Title level={3} style={{ marginTop: '16px', color: '#8c8c8c' }}>
        Доступ запрещен
      </Title>
      <Paragraph style={{ color: '#8c8c8c', marginTop: '8px' }}>
        У вас нет прав для доступа к панели администратора
      </Paragraph>
    </div>
  );
};

export default AccessDenied;