import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI, authAPI } from '../utils/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', search: '', accountManager: 'all' });
  const user = authAPI.getUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmissionDetails = async (submissionId) => {
    try {
      const response = await dashboardAPI.getSubmissionDetails(submissionId);
      setSelectedSubmission(response.data);
    } catch (err) {
      console.error('Failed to load submission details:', err);
    }
  };

  const copyChecklistUrl = (e, locationId) => {
    e.stopPropagation(); // Prevent row click
    const url = `${window.location.origin}/checklist/${locationId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Checklist URL copied to clipboard!');
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'current': 'badge-success',
      'stale': 'badge-warning',
      'overdue': 'badge-error'
    };
    return `badge ${statusMap[status] || 'badge-info'}`;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper function to calculate location staleness status
  const getLocationStatus = (location) => {
    if (!location.last_submission_date) return 'overdue';

    const now = new Date();
    const lastService = new Date(location.last_submission_date);
    const daysSinceService = Math.floor((now - lastService) / (1000 * 60 * 60 * 24));
    const interval = location.service_interval_days || 7;

    if (daysSinceService <= interval) return 'current';
    else if (daysSinceService <= interval * 1.5) return 'stale';
    else return 'overdue';
  };

  const filteredLocations = data?.locations.filter(location => {
    const status = getLocationStatus(location);
    const matchesStatus = filter.status === 'all' || status === filter.status;
    const matchesSearch = !filter.search ||
      location.location_name.toLowerCase().includes(filter.search.toLowerCase()) ||
      location.location_id?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesAccountManager = filter.accountManager === 'all' || location.account_manager_id === filter.accountManager;
    return matchesStatus && matchesSearch && matchesAccountManager;
  }) || [];

  const filteredStats = {
    totalLocations: filteredLocations.length,
    currentServices: filteredLocations.filter(l => getLocationStatus(l) === 'current').length,
    staleServices: filteredLocations.filter(l => getLocationStatus(l) === 'stale').length,
    overdueServices: filteredLocations.filter(l => getLocationStatus(l) === 'overdue').length
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: 'var(--space-2xl)' }}>
      <Header showLogout />

      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-secondary text-lg">
            Managing {filteredStats.totalLocations} location{filteredStats.totalLocations !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="stat-card">
            <div className="stat-label">Total Locations</div>
            <div className="stat-value">{filteredStats.totalLocations}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Current</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {filteredStats.currentServices}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Stale</div>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
              {filteredStats.staleServices}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Overdue</div>
            <div className="stat-value" style={{ color: 'var(--color-error)' }}>
              {filteredStats.overdueServices}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by location or IVR..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <label className="form-label">Account Manager</label>
              <select
                className="form-select"
                value={filter.accountManager}
                onChange={(e) => setFilter(prev => ({ ...prev, accountManager: e.target.value }))}
              >
                <option value="all">All Account Managers</option>
                {data?.accountManagers.map(am => (
                  <option key={am.account_manager_id} value={am.account_manager_id}>
                    {am.first_name} {am.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '200px' }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="current">Current</option>
                <option value="stale">Stale</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Locations Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Location Status
            </h2>
            <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-xs)' }}>
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Subcontractor</th>
                  <th>Status</th>
                  <th>Last Service</th>
                  <th>Days Since</th>
                  <th>Interval</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary" style={{ padding: 'var(--space-2xl)' }}>
                      No locations found
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map(location => {
                    const status = getLocationStatus(location);
                    const daysSince = location.last_submission_date
                      ? Math.floor((new Date() - new Date(location.last_submission_date)) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <tr
                        key={location.location_id}
                        style={{ cursor: location.last_submission_id ? 'pointer' : 'default' }}
                        onClick={() => location.last_submission_id && viewSubmissionDetails(location.last_submission_id)}
                      >
                        <td>
                          <div style={{ fontWeight: 500 }}>{location.location_name}</div>
                          <div className="text-secondary text-sm mono">{location.location_id}</div>
                        </td>
                        <td className="text-sm">{location.subcontractor_name || 'Unassigned'}</td>
                        <td>
                          <span className={getStatusBadge(status)}>
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="text-sm">
                          {location.last_submission_date
                            ? new Date(location.last_submission_date).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="text-sm">
                          {daysSince !== null ? `${daysSince} day${daysSince !== 1 ? 's' : ''}` : '-'}
                        </td>
                        <td className="text-sm">
                          {location.service_interval_days} days
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => copyChecklistUrl(e, location.location_id)}
                            >
                              Copy URL
                            </button>
                          </div>
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

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ marginBottom: '0.5rem' }}>{selectedSubmission.location_name}</h2>
              <p className="text-secondary">
                {selectedSubmission.address}, {selectedSubmission.city}, {selectedSubmission.state}
              </p>
            </div>

            <div className="modal-body">
              {/* Submission Info */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Submission Information</h3>
                <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      IVR Number
                    </div>
                    <div className="mono">{selectedSubmission.ivr_ticket_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Submitted By
                    </div>
                    <div>{selectedSubmission.submitted_by || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Submitted Date
                    </div>
                    <div>{selectedSubmission.submitted_date ? new Date(selectedSubmission.submitted_date).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Subcontractor
                    </div>
                    <div>{selectedSubmission.subcontractor_name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Checklist Data */}
              {selectedSubmission.checklist_data && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Checklist Responses</h3>
                  <div style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    {Object.entries(selectedSubmission.checklist_data).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{ fontSize: '1.25rem' }}>{value ? '✓' : '✗'}</span>
                        <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSubmission.notes && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Notes</h3>
                  <div style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    {selectedSubmission.notes}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedSubmission.photos && selectedSubmission.photos.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Photos ({selectedSubmission.photos.length})</h3>
                  <div className="photo-preview-grid">
                    {selectedSubmission.photos.map(photo => (
                      <div key={photo.photo_id} className="photo-preview">
                        <img src={`/api${photo.file_path}`} alt={photo.photo_type} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
