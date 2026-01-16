import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function IVRs() {
  const [loading, setLoading] = useState(true);
  const [ivrs, setIvrs] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIVR, setSelectedIVR] = useState(null);

  useEffect(() => {
    loadIVRs();
  }, []);

  const loadIVRs = async () => {
    try {
      const response = await dashboardAPI.getIVRs();
      setIvrs(response.data);
    } catch (err) {
      console.error('Failed to load IVRs:', err);
      setError('Failed to load IVRs');
    } finally {
      setLoading(false);
    }
  };

  const copyChecklistUrl = (locationId) => {
    const url = `${window.location.origin}/checklist/${locationId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Checklist URL copied to clipboard!');
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle date fields
      if (sortConfig.key.includes('date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle numbers
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span style={{ opacity: 0.3, marginLeft: '0.25rem' }}>↕</span>;
    }
    return <span style={{ marginLeft: '0.25rem' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const getIVRStatus = (ivr) => {
    const today = new Date();
    const startDate = new Date(ivr.start_date);
    const expirationDate = new Date(ivr.expiration_date);
    const isActive = today >= startDate && today <= expirationDate;
    const isExpired = today > expirationDate;
    return {
      isActive,
      isExpired,
      isFuture: !isActive && !isExpired,
      statusText: isActive ? 'Active' : isExpired ? 'Expired' : 'Future',
      badgeClass: isActive ? 'badge-success' : isExpired ? 'badge-error' : 'badge-info'
    };
  };

  const filteredIVRs = ivrs.filter(ivr => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ivr.location_name?.toLowerCase().includes(search) ||
      ivr.location_id?.toLowerCase().includes(search) ||
      ivr.ivr_ticket_number?.toLowerCase().includes(search) ||
      ivr.period_label?.toLowerCase().includes(search)
    );
  });

  const sortedAndFilteredIVRs = getSortedData(filteredIVRs);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: 'var(--space-2xl)' }}>
      <Header showLogout />

      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>ServiceChannel IVRs</h1>
          <p className="text-secondary text-lg">
            {sortedAndFilteredIVRs.length} IVR{sortedAndFilteredIVRs.length !== 1 ? 's' : ''}
            {searchTerm && ` (filtered from ${ivrs.length})`}
          </p>
        </div>

        {/* Search Box */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <input
            type="text"
            placeholder="Search IVRs by location, ticket number, or period..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              background: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>

        {/* IVR Details Modal */}
        {selectedIVR && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-lg)'
            }}
            onClick={() => setSelectedIVR(null)}
          >
            <div
              className="card"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 className="card-title" style={{ marginBottom: 'var(--space-xs)' }}>
                    IVR Details
                  </h2>
                  <p className="text-secondary mono text-sm">{selectedIVR.ivr_id}</p>
                </div>
                <button
                  onClick={() => setSelectedIVR(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    padding: '0',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Location
                  </div>
                  <div style={{ fontWeight: 500 }}>{selectedIVR.location_name}</div>
                  <div className="text-secondary text-sm mono">{selectedIVR.location_id}</div>
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      IVR Ticket Number
                    </div>
                    <div className="mono">{selectedIVR.ivr_ticket_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Period
                    </div>
                    <div>{selectedIVR.period_label}</div>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Start Date
                    </div>
                    <div>{new Date(selectedIVR.start_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Expiration Date
                    </div>
                    <div>{new Date(selectedIVR.expiration_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Status
                  </div>
                  <span className={`badge ${getIVRStatus(selectedIVR).badgeClass}`}>
                    {getIVRStatus(selectedIVR).statusText}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Import Date
                  </div>
                  <div>{new Date(selectedIVR.import_date).toLocaleDateString()}</div>
                </div>

                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => copyChecklistUrl(selectedIVR.location_id)}
                    style={{ width: '100%' }}
                  >
                    Copy Checklist URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Current IVRs
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('location_name')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Location <SortIcon columnKey="location_name" />
                  </th>
                  <th
                    onClick={() => handleSort('ivr_ticket_number')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    IVR Ticket Number <SortIcon columnKey="ivr_ticket_number" />
                  </th>
                  <th
                    onClick={() => handleSort('period_label')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Period <SortIcon columnKey="period_label" />
                  </th>
                  <th
                    onClick={() => handleSort('start_date')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Start Date <SortIcon columnKey="start_date" />
                  </th>
                  <th
                    onClick={() => handleSort('expiration_date')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Expiration Date <SortIcon columnKey="expiration_date" />
                  </th>
                  <th>Status</th>
                  <th style={{ width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredIVRs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary" style={{ padding: 'var(--space-2xl)' }}>
                      {searchTerm ? 'No IVRs match your search' : 'No IVRs found'}
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredIVRs.map(ivr => {
                    const status = getIVRStatus(ivr);
                    return (
                      <tr
                        key={ivr.ivr_id}
                        onClick={() => setSelectedIVR(ivr)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      >
                        <td>
                          <div style={{ fontWeight: 500 }}>{ivr.location_name}</div>
                          <div className="text-secondary text-sm mono">{ivr.location_id}</div>
                        </td>
                        <td className="mono text-sm">{ivr.ivr_ticket_number}</td>
                        <td className="text-sm">{ivr.period_label}</td>
                        <td className="text-sm">{new Date(ivr.start_date).toLocaleDateString()}</td>
                        <td className="text-sm">{new Date(ivr.expiration_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${status.badgeClass}`}>
                            {status.statusText}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => copyChecklistUrl(ivr.location_id)}
                          >
                            Copy URL
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
