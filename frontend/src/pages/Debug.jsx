import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function Debug() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [activeTable, setActiveTable] = useState('locations');

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    try {
      const response = await dashboardAPI.getDebugData();
      setData(response.data);
    } catch (err) {
      console.error('Failed to load debug data:', err);
      setError('Failed to load debug data');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (tableName, rows) => {
    if (!rows || rows.length === 0) {
      return (
        <div style={{ padding: 'var(--space-xl)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }} className="text-secondary">
          No data in {tableName}
        </div>
      );
    }

    const columns = Object.keys(rows[0]);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={{ whiteSpace: 'nowrap', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col} style={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                    {typeof row[col] === 'object' && row[col] !== null
                      ? JSON.stringify(row[col])
                      : row[col] === null
                      ? <span className="text-tertiary">NULL</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Header showLogout />
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  const tables = [
    { key: 'checklists', label: 'Checklists', count: data?.checklists?.length || 0 },
    { key: 'account_managers', label: 'Account Managers', count: data?.account_managers?.length || 0 },
    { key: 'subcontractors', label: 'Subcontractors', count: data?.subcontractors?.length || 0 },
    { key: 'locations', label: 'Locations', count: data?.locations?.length || 0 },
    { key: 'ivrs', label: 'IVRs', count: data?.ivrs?.length || 0 },
    { key: 'services', label: 'Services', count: data?.services?.length || 0 },
    { key: 'checklist_submissions', label: 'Submissions', count: data?.checklist_submissions?.length || 0 },
    { key: 'photos', label: 'Photos', count: data?.photos?.length || 0 }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: 'var(--space-2xl)' }}>
      <Header showLogout />

      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>Database Debug View</h1>
          <p className="text-secondary text-lg">
            Raw database tables for development and debugging
          </p>
        </div>

        {/* Table Selector */}
        <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {tables.map(table => (
            <button
              key={table.key}
              className={activeTable === table.key ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setActiveTable(table.key)}
            >
              {table.label} ({table.count})
            </button>
          ))}
        </div>

        {/* Active Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              {tables.find(t => t.key === activeTable)?.label || activeTable}
            </h2>
            <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-xs)' }}>
              {data?.[activeTable]?.length || 0} row{data?.[activeTable]?.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ padding: 'var(--space-lg)' }}>
            {renderTable(activeTable, data?.[activeTable])}
          </div>
        </div>
      </div>
    </div>
  );
}
