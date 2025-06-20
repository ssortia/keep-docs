import { ReactNode } from 'react';
import { Space, Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div style={{ 
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
          <Title level={2} style={{ margin: 0, marginBottom: subtitle ? '4px' : 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          )}
        </div>
        {extra && (
          <div style={{ flex: '0 0 auto' }}>
            <Space wrap>
              {extra}
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}
