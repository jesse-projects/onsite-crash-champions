import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function Subcontractors() {
  const [loading, setLoading] = useState(true);
  const [subcontractors, setSubcontractors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubcontractors();
  }, []);

  const loadSubcontractors = async () => {
    try {
      const response = await dashboardAPI.getSubcontractors();
      setSubcontractors(response.data);
    } catch (err) {
      console.error('Failed to load subcontractors:', err);
      setError('Failed to load subcontractors');
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
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>Subcontractors / Vendors</h1>
          <p className="text-secondary text-lg">
            {subcontractors.length} active subcontractor{subcontractors.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {subcontractors.map(sub => (
            <div key={sub.subcontractor_id} className="card">
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h2 className="card-title" style={{ marginBottom: 'var(--space-xs)' }}>
                  {sub.subcontractor_name}
                </h2>
                <p className="text-secondary mono text-sm">{sub.subcontractor_id}</p>
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Email
                  </div>
                  <div>{sub.email}</div>
                </div>
                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Phone
                  </div>
                  <div>{sub.phone}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
                  Assigned Locations ({sub.locations?.length || 0})
                </h3>

                {sub.locations && sub.locations.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Location ID</th>
                          <th>Name</th>
                          <th>City, State</th>
                          <th style={{ width: '140px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sub.locations.map(loc => (
                          <tr key={loc.location_id}>
                            <td className="mono text-sm">{loc.location_id}</td>
                            <td>{loc.location_name}</td>
                            <td className="text-sm">{loc.city}, {loc.state}</td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => copyChecklistUrl(loc.location_id)}
                              >
                                Copy URL
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: 'var(--space-lg)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }} className="text-secondary">
                    No locations assigned
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
