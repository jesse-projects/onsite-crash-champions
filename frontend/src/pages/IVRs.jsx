import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function IVRs() {
  const [loading, setLoading] = useState(true);
  const [ivrs, setIvrs] = useState([]);
  const [error, setError] = useState('');

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
            {ivrs.length} active IVR{ivrs.length !== 1 ? 's' : ''}
          </p>
        </div>

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
                  <th>Location</th>
                  <th>IVR Ticket Number</th>
                  <th>Period</th>
                  <th>Start Date</th>
                  <th>Expiration Date</th>
                  <th>Status</th>
                  <th style={{ width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ivrs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary" style={{ padding: 'var(--space-2xl)' }}>
                      No IVRs found
                    </td>
                  </tr>
                ) : (
                  ivrs.map(ivr => {
                    const today = new Date();
                    const startDate = new Date(ivr.start_date);
                    const expirationDate = new Date(ivr.expiration_date);
                    const isActive = today >= startDate && today <= expirationDate;
                    const isExpired = today > expirationDate;
                    const isFuture = today < startDate;

                    return (
                      <tr key={ivr.ivr_id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{ivr.location_name}</div>
                          <div className="text-secondary text-sm mono">{ivr.location_id}</div>
                        </td>
                        <td className="mono text-sm">{ivr.ivr_ticket_number}</td>
                        <td className="text-sm">{ivr.period_label}</td>
                        <td className="text-sm">{startDate.toLocaleDateString()}</td>
                        <td className="text-sm">{expirationDate.toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-success' : isExpired ? 'badge-error' : 'badge-info'}`}>
                            {isActive ? 'Active' : isExpired ? 'Expired' : 'Future'}
                          </span>
                        </td>
                        <td>
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
