'use client';

import { ConfigProvider, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { ThemeContext, useThemeState } from '../hooks/useTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useThemeState();

  const antdTheme = {
    algorithm: themeState.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  return (
    <ThemeContext.Provider value={themeState}>
      <ConfigProvider 
        theme={antdTheme} 
        locale={ruRU}
        componentSize="middle"
        direction="ltr"
      >
        <div style={{ 
          opacity: themeState.mounted ? 1 : 0, 
          transition: 'opacity 0.1s ease' 
        }}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}