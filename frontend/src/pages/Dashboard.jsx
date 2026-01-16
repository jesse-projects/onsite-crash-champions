import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI, authAPI } from '../utils/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // NEW: Location details view
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' or 'submissions'
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
      setExpandedSections({}); // Reset expanded sections for new submission
    } catch (err) {
      console.error('Failed to load submission details:', err);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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

        {/* Tabs */}
        <div style={{ marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              onClick={() => setActiveTab('locations')}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                background: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeTab === 'locations' ? 'var(--color-primary)' : 'transparent'}`,
                color: activeTab === 'locations' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'locations' ? 600 : 400,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
            >
              Locations
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                background: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${activeTab === 'submissions' ? 'var(--color-primary)' : 'transparent'}`,
                color: activeTab === 'submissions' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'submissions' ? 600 : 400,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
            >
              Submissions
            </button>
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
        {activeTab === 'locations' && (
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
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedLocation(location)}
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
        )}

        {/* Submissions Table */}
        {activeTab === 'submissions' && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>
                All Submissions
              </h2>
              <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-xs)' }}>
                {data?.submissions.length || 0} submission{data?.submissions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Subcontractor</th>
                    <th>Submitted Date</th>
                    <th>IVR Number</th>
                    <th>Photos</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data?.submissions || data.submissions.length === 0) ? (
                    <tr>
                      <td colSpan="6" className="text-center text-secondary" style={{ padding: 'var(--space-2xl)' }}>
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    data.submissions
                      .filter(sub => {
                        const matchesSearch = !filter.search ||
                          sub.location_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
                          sub.location_id?.toLowerCase().includes(filter.search.toLowerCase());
                        const matchesAccountManager = filter.accountManager === 'all' || sub.account_manager_id === filter.accountManager;
                        return matchesSearch && matchesAccountManager;
                      })
                      .sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date))
                      .map(submission => (
                        <tr
                          key={submission.submission_id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => viewSubmissionDetails(submission.submission_id)}
                        >
                          <td>
                            <div style={{ fontWeight: 500 }}>{submission.location_name}</div>
                            <div className="text-secondary text-sm mono">{submission.location_id}</div>
                          </td>
                          <td className="text-sm">{submission.subcontractor_name || 'N/A'}</td>
                          <td className="text-sm">
                            {submission.submitted_date
                              ? new Date(submission.submitted_date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="mono text-sm">{submission.ivr_ticket_number || 'N/A'}</td>
                          <td className="text-sm">
                            {submission.photo_count || 0} photo{submission.photo_count !== 1 ? 's' : ''}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewSubmissionDetails(submission.submission_id);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      {selectedLocation && !selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>{selectedLocation.location_name}</h2>
                  <p className="text-secondary mono text-sm">{selectedLocation.location_id}</p>
                  <p className="text-secondary text-sm" style={{ marginTop: '0.5rem' }}>
                    {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
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
            </div>

            <div className="modal-body">
              {/* Location Info */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Location Information</h3>
                <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Subcontractor
                    </div>
                    <div>{selectedLocation.subcontractor_name || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Account Manager
                    </div>
                    <div>{selectedLocation.account_manager_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Service Interval
                    </div>
                    <div>{selectedLocation.service_interval_days} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Current Status
                    </div>
                    <span className={getStatusBadge(getLocationStatus(selectedLocation))}>
                      {getStatusLabel(getLocationStatus(selectedLocation))}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Last Service
                    </div>
                    <div>
                      {selectedLocation.last_submission_date
                        ? new Date(selectedLocation.last_submission_date).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Days Since Service
                    </div>
                    <div>
                      {selectedLocation.last_submission_date
                        ? `${Math.floor((new Date() - new Date(selectedLocation.last_submission_date)) / (1000 * 60 * 60 * 24))} days`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Service History</h3>
                {(() => {
                  const locationSubmissions = data?.submissions.filter(
                    sub => sub.location_id === selectedLocation.location_id
                  ).sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date)) || [];

                  if (locationSubmissions.length === 0) {
                    return (
                      <div style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }} className="text-secondary">
                        No service history available
                      </div>
                    );
                  }

                  return (
                    <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="table" style={{ fontSize: '0.875rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>
                          <tr>
                            <th>Submitted Date</th>
                            <th>Submitted By</th>
                            <th>IVR Number</th>
                            <th>Photos</th>
                            <th style={{ width: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locationSubmissions.map(submission => (
                            <tr key={submission.submission_id}>
                              <td className="text-sm">
                                {new Date(submission.submitted_date).toLocaleDateString()}
                              </td>
                              <td className="text-sm">{submission.submitted_by || 'N/A'}</td>
                              <td className="mono text-sm">{submission.ivr_ticket_number || 'N/A'}</td>
                              <td className="text-sm">
                                {submission.photo_count || 0} photo{submission.photo_count !== 1 ? 's' : ''}
                              </td>
                              <td>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    viewSubmissionDetails(submission.submission_id);
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => copyChecklistUrl({ stopPropagation: () => {} }, selectedLocation.location_id)}
                  style={{ width: '100%' }}
                >
                  Copy Checklist URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => { setSelectedSubmission(null); setSelectedLocation(null); setExpandedSections({}); }}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  {selectedLocation && (
                    <button
                      onClick={() => {
                        setSelectedSubmission(null);
                        setExpandedSections({});
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: '0',
                        marginBottom: 'var(--space-sm)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      ← Back to {selectedLocation.location_name}
                    </button>
                  )}
                  <h2 style={{ marginBottom: '0.5rem' }}>{selectedSubmission.location_name}</h2>
                  <p className="text-secondary">
                    {selectedSubmission.address}, {selectedSubmission.city}, {selectedSubmission.state}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setSelectedLocation(null);
                    setExpandedSections({});
                  }}
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

              {/* Checklist Data - Collapsible Sections */}
              {selectedSubmission.checklist_data && selectedSubmission.checklist_config && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Checklist Responses</h3>
                  {selectedSubmission.checklist_config.sections?.map((section, idx) => {
                    const isExpanded = expandedSections[section.id] || false;

                    // Calculate section status
                    const sectionTasks = section.tasks.map((task, taskIdx) => {
                      const taskId = `${section.id}_${taskIdx}`;
                      return selectedSubmission.checklist_data[taskId];
                    });

                    const allComplete = sectionTasks.every(val => val === 'complete');
                    const anyIncomplete = sectionTasks.some(val => val === 'incomplete' || val === 'n/a');
                    const hasNotes = selectedSubmission.checklist_data[`${section.id}_notes`];

                    // Determine icon and color
                    let icon = '?';
                    let iconColor = 'var(--color-warning)';

                    if (allComplete && !hasNotes) {
                      icon = '✓';
                      iconColor = 'var(--color-success)';
                    } else if (anyIncomplete) {
                      icon = '✗';
                      iconColor = 'var(--color-error)';
                    } else if (hasNotes) {
                      icon = '?';
                      iconColor = 'var(--color-warning)';
                    }

                    return (
                      <div key={section.id} style={{ marginBottom: 'var(--space-md)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <div
                          onClick={() => toggleSection(section.id)}
                          style={{
                            padding: 'var(--space-md)',
                            background: 'var(--color-bg-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        >
                          <span style={{ fontSize: '1.5rem', color: iconColor, fontWeight: 'bold', minWidth: '24px' }}>
                            {icon}
                          </span>
                          <span style={{ flex: 1, fontWeight: 500 }}>
                            {section.title}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-primary)' }}>
                            {section.tasks.map((task, taskIdx) => {
                              const taskId = `${section.id}_${taskIdx}`;
                              const value = selectedSubmission.checklist_data[taskId];

                              return (
                                <div key={taskId} style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                  <span style={{ fontSize: '1.125rem', minWidth: '20px' }}>
                                    {value === 'complete' ? '✓' : value === 'incomplete' ? '✗' : value === 'n/a' ? '—' : '?'}
                                  </span>
                                  <span className="text-sm">{task}</span>
                                </div>
                              );
                            })}

                            {hasNotes && (
                              <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                                <div className="text-xs text-tertiary" style={{ marginBottom: 'var(--space-xs)' }}>Notes:</div>
                                <div className="text-sm" style={{ fontStyle: 'italic' }}>
                                  {selectedSubmission.checklist_data[`${section.id}_notes`]}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                onClick={() => { setSelectedSubmission(null); setExpandedSections({}); }}
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
