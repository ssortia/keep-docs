'use client';

import { Layout, Menu, Button, Space, Switch, Drawer } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  SafetyOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined, 
  SettingOutlined,
  BookOutlined,
  KeyOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { MenuProps } from 'antd';
import { JSX, useState, useEffect } from 'react';

const { Header } = Layout;

interface MenuItem {
  key: string;
  icon: JSX.Element;
  name: string;
  link?: string;
  permission?: string;
  children?: MenuItem[];
}

export default function AppHeader() {
  const { user, userPermissions, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 988);
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  const menuConfig: MenuItem[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      name: "Профиль",
      link: "/",
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      name: "Пользователи",
      link: "/users",
      permission: "users.view",
    },
    {
      key: 'dictionaries',
      icon: <BookOutlined />,
      name: "Справочники",
      children: [
        {
          key: 'dictionaries.roles',
          icon: <SafetyOutlined />,
          name: "Роли",
          link: "/dictionaries/roles",
          permission: "roles.view",
        },
        {
          key: 'dictionaries.permissions',
          icon: <KeyOutlined />,
          name: "Права",
          link: "/dictionaries/permissions",
          permission: "permissions.view",
        },
      ],
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      name: "Админ панель",
      link: "/admin",
      permission: "admin.access",
    },
  ];

  const getMenuItems = (): MenuProps['items'] => {
    if (!user) return [];

    return menuConfig
      .filter(item => {
        // Если у элемента есть дочерние элементы, проверяем права для них
        if (item.children) {
          return item.children.some(child => !child.permission || hasPermission(child.permission));
        }
        // Для обычных элементов проверяем права или отсутствие требований к правам
        return !item.permission || hasPermission(item.permission);
      })
      .map(item => {
        // Если у элемента есть дочерние элементы
        if (item.children) {
          const visibleChildren = item.children
            .filter(child => !child.permission || hasPermission(child.permission))
            .map(child => ({
              key: child.key,
              icon: child.icon,
              label: <Link href={child.link || "#"}>{child.name}</Link>,
            }));

          return {
            key: item.key,
            icon: item.icon,
            label: item.name,
            children: visibleChildren,
          };
        }

        // Обычный элемент меню
        return {
          key: item.key,
          icon: item.icon,
          label: <Link href={item.link || '#'}>{item.name}</Link>,
        };
      });
  };

  const handleLogout = () => {
    logout();
  };

  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Get menu items for drawer (vertical mode)
  const getDrawerMenuItems = () => {
    if (!user) return [];

    return menuConfig
      .filter(item => {
        if (item.children) {
          return item.children.some(child => !child.permission || hasPermission(child.permission));
        }
        return !item.permission || hasPermission(item.permission);
      })
      .map(item => {
        if (item.children) {
          const visibleChildren = item.children
            .filter(child => !child.permission || hasPermission(child.permission))
            .map(child => ({
              key: child.key,
              icon: child.icon,
              label: (
                <Link href={child.link || "#"} onClick={closeDrawer}>
                  {child.name}
                </Link>
              ),
            }));

          return {
            key: item.key,
            icon: item.icon,
            label: item.name,
            children: visibleChildren,
          };
        }

        return {
          key: item.key,
          icon: item.icon,
          label: (
            <Link href={item.link || '#'} onClick={closeDrawer}>
              {item.name}
            </Link>
          ),
        };
      });
  };

  return (
    <>
      <Header style={{ 
        background: 'var(--background)', 
        padding: isMobile ? '0 16px' : '0 50px', 
        boxShadow: theme === 'dark' ? '0 2px 8px rgba(255,255,255,0.06)' : '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: theme === 'dark' ? '1px solid #303030' : '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginRight: isMobile ? '16px' : '40px' 
          }}>
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={isMobile ? 80 : 120}
              height={isMobile ? 16 : 25}
              priority
              style={{
                filter: theme === 'dark' ? 'invert(1)' : 'none'
              }}
            />
          </Link>
          
          {/* Desktop Menu */}
          {user && !isLoading && !isMobile && (
            <Menu
              mode="horizontal"
              items={getMenuItems()}
              style={{ 
                border: 'none',
                background: 'transparent',
                minWidth: '300px'
              }}
              disabledOverflow
              // overflowedIndicator={null}
            />
          )}

          {/* Mobile Menu Button */}
          {user && !isLoading && isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={openDrawer}
              style={{ fontSize: '18px' }}
            />
          )}
        </div>

        <Space size={isMobile ? 'small' : 'middle'}>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            size={isMobile ? 'small' : 'default'}
          />
          
          {user && !isLoading ? (
            <>
              {/*{!isMobile && (*/}
              {/*  <span style={{ */}
              {/*    color: theme === 'dark' ? '#ccc' : '#666',*/}
              {/*    fontSize: '14px' */}
              {/*  }}>*/}
              {/*    Привет, {user.fullName || user.email}!*/}
              {/*  </span>*/}
              {/*)}*/}
              <Button 
                type="text" 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && 'Выйти'}
              </Button>
            </>
          ) : (
            <Space size="small">
              <Link href="/login">
                <Button 
                  type="text" 
                  icon={<LoginOutlined />}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {!isMobile && 'Войти'}
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {!isMobile && 'Регистрация'}
                </Button>
              </Link>
            </Space>
          )}
        </Space>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
              style={{
                filter: theme === 'dark' ? 'invert(1)' : 'none'
              }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeDrawer}
            />
          </div>
        }
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        width={280}
        closable={false}
        styles={{
          body: { padding: 0 },
          header: { 
            borderBottom: theme === 'dark' ? '1px solid #303030' : '1px solid #f0f0f0',
            background: 'var(--background)'
          }
        }}
      >
        {user && (
          <div>
            {/* User Info in Drawer */}
            <div style={{ 
              padding: '16px', 
              borderBottom: theme === 'dark' ? '1px solid #303030' : '1px solid #f0f0f0',
              background: theme === 'dark' ? '#1f1f1f' : '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <UserOutlined style={{ marginRight: '8px', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {user.fullName || user.email}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: theme === 'dark' ? '#8c8c8c' : '#666' }}>
                {user.email}
              </div>
            </div>

            {/* Navigation Menu */}
            <Menu
              mode="inline"
              items={getDrawerMenuItems()}
              style={{ 
                border: 'none',
                background: 'var(--background)'
              }}
            />

            {/* Logout Button */}
            <div style={{ 
              padding: '16px', 
              borderTop: theme === 'dark' ? '1px solid #303030' : '1px solid #f0f0f0',
              marginTop: 'auto'
            }}>
              <Button 
                type="text" 
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout();
                  closeDrawer();
                }}
                block
                style={{ textAlign: 'left' }}
              >
                Выйти
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}