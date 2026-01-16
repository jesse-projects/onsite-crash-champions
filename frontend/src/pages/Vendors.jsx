import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function Vendors() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [vendorTabs, setVendorTabs] = useState({}); // Track active tab per vendor

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await dashboardAPI.getVendors();
      setVendors(response.data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      setError('Failed to load vendors');
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

  const setVendorTab = (vendorId, tab) => {
    setVendorTabs(prev => ({ ...prev, [vendorId]: tab }));
  };

  const getVendorTab = (vendorId) => {
    return vendorTabs[vendorId] || 'locations';
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
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>Vendors</h1>
          <p className="text-secondary text-lg">
            {vendors.length} active vendor{vendors.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {vendors.map(vendor => (
            <div key={vendor.subcontractor_id} className="card">
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h2 className="card-title" style={{ marginBottom: 'var(--space-xs)' }}>
                  {vendor.subcontractor_name}
                </h2>
                <p className="text-secondary mono text-sm">{vendor.subcontractor_id}</p>
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Email
                  </div>
                  <div>{vendor.email}</div>
                </div>
                <div>
                  <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Phone
                  </div>
                  <div>{vendor.phone}</div>
                </div>
              </div>

              <div>
                {/* Tabs */}
                <div style={{ marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button
                      onClick={() => setVendorTab(vendor.subcontractor_id, 'locations')}
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `3px solid ${getVendorTab(vendor.subcontractor_id) === 'locations' ? 'var(--color-primary)' : 'transparent'}`,
                        color: getVendorTab(vendor.subcontractor_id) === 'locations' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: getVendorTab(vendor.subcontractor_id) === 'locations' ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Locations ({vendor.locations?.length || 0})
                    </button>
                    <button
                      onClick={() => setVendorTab(vendor.subcontractor_id, 'submissions')}
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `3px solid ${getVendorTab(vendor.subcontractor_id) === 'submissions' ? 'var(--color-primary)' : 'transparent'}`,
                        color: getVendorTab(vendor.subcontractor_id) === 'submissions' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: getVendorTab(vendor.subcontractor_id) === 'submissions' ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Submissions ({vendor.submissions?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Locations Tab */}
                {getVendorTab(vendor.subcontractor_id) === 'locations' && (
                  vendor.locations && vendor.locations.length > 0 ? (
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
                          {vendor.locations.map(loc => (
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
                  )
                )}

                {/* Submissions Tab */}
                {getVendorTab(vendor.subcontractor_id) === 'submissions' && (
                  vendor.submissions && vendor.submissions.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Location</th>
                            <th>Submitted Date</th>
                            <th>IVR Number</th>
                            <th>Photos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendor.submissions
                            .sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date))
                            .map(sub => (
                              <tr key={sub.submission_id}>
                                <td>
                                  <div style={{ fontWeight: 500 }}>{sub.location_name}</div>
                                  <div className="text-secondary text-sm mono">{sub.location_id}</div>
                                </td>
                                <td className="text-sm">
                                  {sub.submitted_date
                                    ? new Date(sub.submitted_date).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                                <td className="mono text-sm">{sub.ivr_ticket_number || 'N/A'}</td>
                                <td className="text-sm">
                                  {sub.photo_count || 0} photo{sub.photo_count !== 1 ? 's' : ''}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-lg)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }} className="text-secondary">
                      No submissions yet
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
