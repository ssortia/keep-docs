import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Button,
  Tooltip,
  Typography,
  Modal,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useAuditLogs, type AuditLog, type AuditLogFilters, type AuditLogStats } from '@/app/hooks/useAuditLogs';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const AuditLogsCard: React.FC = () => {
  const {
    auditLogs,
    loading,
    error,
    meta,
    fetchAuditLogs,
    fetchAuditLogById,
    fetchStats,
    fetchAvailableActions
  } = useAuditLogs();

  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Загружаем данные при изменении фильтров, сортировки или пагинации
  useEffect(() => {
    void fetchAuditLogs(filters, { sortBy, sortOrder }, { page: currentPage, limit: pageSize });
  }, [filters, sortBy, sortOrder, currentPage, pageSize, fetchAuditLogs]);

  // Загружаем статистику и доступные действия при монтировании
  useEffect(() => {
    const loadInitialData = async () => {
      const [statsData, actionsData] = await Promise.all([
        fetchStats('day'),
        fetchAvailableActions()
      ]);
      
      if (statsData) setStats(statsData);
      setAvailableActions(actionsData);
    };

    void loadInitialData();
  }, [fetchStats, fetchAvailableActions]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<AuditLog> | SorterResult<AuditLog>[]
  ) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    if (!Array.isArray(sorter) && sorter.field) {
      setSortBy(sorter.field as string);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD')
      }));
    } else {
      setFilters(prev => {
        const { dateFrom, dateTo, ...rest } = prev;
        return rest;
      });
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const refresh = () => {
    void fetchAuditLogs(filters, { sortBy, sortOrder }, { page: currentPage, limit: pageSize });
  };

  const showLogDetails = async (log: AuditLog) => {
    const detailedLog = await fetchAuditLogById(log.id);
    if (detailedLog) {
      setSelectedLog(detailedLog);
      setIsDetailModalVisible(true);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getActionDisplayName = (action: string) => {
    const actionMap: Record<string, string> = {
      'view_': 'Просмотр',
      'create_': 'Создание',
      'update_': 'Обновление',
      'delete_': 'Удаление',
      'login': 'Вход',
      'logout': 'Выход'
    };

    for (const [key, value] of Object.entries(actionMap)) {
      if (action.startsWith(key)) {
        return value;
      }
    }

    return action;
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Дата/Время',
      dataIndex: 'formattedDate',
      key: 'createdAt',
      sorter: true,
      width: 150,
      render: (date, record) => (
        <Tooltip title={record.createdAt}>
          <Text style={{ fontSize: '12px' }}>{date}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          {record.user ? (
            <div>
              <Text strong style={{ fontSize: '12px' }}>{record.user.fullName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>{record.user.email}</Text>
            </div>
          ) : (
            <Text type="secondary" italic>Гость</Text>
          )}
        </div>
      )
    },
    {
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => (
        <Tag>{action}</Tag>
      )
    },
    {
      title: 'IP адрес',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip) => (
        <Text code style={{ fontSize: '11px' }}>{ip || 'N/A'}</Text>
      )
    },
    {
      title: 'Детали',
      key: 'metadata',
      width: 200,
      render: (_, record) => (
        <div>
          {record.metadata?.method && (
            <Tag color="default" style={{ fontSize: '10px' }}>
              {record.metadata.method}
            </Tag>
          )}
          {record.metadata?.statusCode && (
            <Tag 
              color={record.metadata.statusCode < 400 ? 'green' : record.metadata.statusCode < 500 ? 'orange' : 'red'}
              style={{ fontSize: '10px' }}
            >
              {record.metadata.statusCode}
            </Tag>
          )}
          <br />
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {record.metadata?.url && record.metadata.url.length > 30 
              ? `${record.metadata.url.substring(0, 30)}...` 
              : record.metadata?.url}
          </Text>
        </div>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showLogDetails(record)}
        />
      )
    }
  ];

  return (
    <div>
      {/* Статистика */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Всего записей" value={stats.totals.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic 
                title="Сегодня" 
                value={stats.totals.period}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic 
                title="Предупреждения" 
                value={stats.totals.warning}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic 
                title="Ошибки" 
                value={stats.totals.error}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>Журнал аудита</Title>
            {meta && <Text type="secondary">({meta.total} записей)</Text>}
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refresh} 
              loading={loading}

            >
              Обновить
            </Button>
          </Space>
        }
      >
        {/* Фильтры */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Поиск по действию, IP, пользователю"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear

            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Тип"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear

              style={{ width: '100%' }}
            >
              <Select.Option value="info">Info</Select.Option>
              <Select.Option value="warning">Warning</Select.Option>
              <Select.Option value="error">Error</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Действие"
              value={filters.action}
              onChange={(value) => handleFilterChange('action', value)}
              allowClear

              style={{ width: '100%' }}
              showSearch
            >
              {availableActions.map(action => (
                <Select.Option key={action} value={action}>
                  {action}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              onChange={handleDateRangeChange}
              format="DD.MM.YYYY"
              style={{ width: '100%' }}
              placeholder={['От', 'До']}
            />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button 
              icon={<ClearOutlined />} 
              onClick={clearFilters}

              block
            >
              Очистить
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Ошибка загрузки"
            description={error}
            type="error"
            style={{ marginBottom: 16 }}
          />
        )}

        <Table<AuditLog>
          columns={columns}
          dataSource={auditLogs}
          rowKey="id"
          loading={loading}

          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} записей`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Модальное окно с деталями */}
      <Modal
        title="Детали записи аудита"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Закрыть
          </Button>
        ]}
        width={800}
      >
        {selectedLog && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>ID:</Text> {selectedLog.id}
              </Col>
              <Col span={12}>
                <Text strong>Тип:</Text> <Tag color={getTypeColor(selectedLog.type)}>{selectedLog.type}</Tag>
              </Col>
              <Col span={12}>
                <Text strong>Пользователь:</Text> {selectedLog.user?.fullName || 'Гость'}
              </Col>
              <Col span={12}>
                <Text strong>Email:</Text> {selectedLog.user?.email || 'N/A'}
              </Col>
              <Col span={12}>
                <Text strong>Действие:</Text> {selectedLog.action}
              </Col>
              <Col span={12}>
                <Text strong>IP адрес:</Text> {selectedLog.ip || 'N/A'}
              </Col>
              <Col span={24}>
                <Text strong>Дата:</Text> {selectedLog.formattedDate}
              </Col>
            </Row>
            
            {selectedLog.metadata && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Метаданные:</Text>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4, 
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 300
                }}>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsCard;