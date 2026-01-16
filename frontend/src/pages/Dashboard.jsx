import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI, authAPI } from '../utils/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
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

  const viewServiceDetails = async (serviceId) => {
    try {
      const response = await dashboardAPI.getServiceDetails(serviceId);
      setSelectedService(response.data);
    } catch (err) {
      console.error('Failed to load service details:', err);
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
      'Completed': 'badge-success',
      'Not Started': 'badge-warning',
      'In Progress': 'badge-info',
      'Overdue': 'badge-error',
      'Incomplete': 'badge-error'
    };
    return `badge ${statusMap[status] || 'badge-info'}`;
  };

  const filteredServices = data?.services.filter(service => {
    const matchesStatus = filter.status === 'all' || service.status === filter.status;
    const matchesSearch = !filter.search ||
      service.location_name.toLowerCase().includes(filter.search.toLowerCase()) ||
      service.ivr_ticket_number?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesAccountManager = filter.accountManager === 'all' || service.account_manager_id === filter.accountManager;
    return matchesStatus && matchesSearch && matchesAccountManager;
  }) || [];

  // Calculate stats based on filtered data
  const filteredLocations = data?.locations.filter(location => {
    return filter.accountManager === 'all' || location.account_manager_id === filter.accountManager;
  }) || [];

  const filteredStats = {
    totalLocations: filteredLocations.length,
    pendingServices: filteredServices.filter(s => s.status === 'Not Started').length,
    completedServices: filteredServices.filter(s => s.status === 'Completed').length,
    overdueServices: filteredServices.filter(s => s.status === 'Overdue').length
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
            <div className="stat-label">Pending Services</div>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
              {filteredStats.pendingServices}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {filteredStats.completedServices}
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
                <option value="Not Started">Not Started</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Service Activity
            </h2>
            <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-xs)' }}>
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>IVR Number</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th>Submitted</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary" style={{ padding: 'var(--space-2xl)' }}>
                      No services found
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(service => (
                    <tr key={service.service_id} onClick={() => viewServiceDetails(service.service_id)}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{service.location_name}</div>
                        <div className="text-secondary text-sm mono">{service.location_id}</div>
                      </td>
                      <td className="mono text-sm">{service.ivr_ticket_number || 'N/A'}</td>
                      <td className="text-sm">{service.period_label || 'N/A'}</td>
                      <td>
                        <span className={getStatusBadge(service.status)}>
                          {service.status}
                        </span>
                      </td>
                      <td className="text-sm">
                        {service.scheduled_date ? new Date(service.scheduled_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-sm">
                        {service.submitted_date ? new Date(service.submitted_date).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => copyChecklistUrl(e, service.location_id)}
                        >
                          Copy URL
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ marginBottom: '0.5rem' }}>{selectedService.location_name}</h2>
              <p className="text-secondary">
                {selectedService.address}, {selectedService.city}, {selectedService.state}
              </p>
            </div>

            <div className="modal-body">
              {/* Service Info */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Service Information</h3>
                <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      IVR Number
                    </div>
                    <div className="mono">{selectedService.ivr_ticket_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Status
                    </div>
                    <span className={getStatusBadge(selectedService.status)}>
                      {selectedService.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Scheduled Date
                    </div>
                    <div>{selectedService.scheduled_date ? new Date(selectedService.scheduled_date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Submitted Date
                    </div>
                    <div>{selectedService.submitted_date ? new Date(selectedService.submitted_date).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
              </div>

              {/* Checklist Data */}
              {selectedService.checklist_data && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Checklist Responses</h3>
                  <div style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    {Object.entries(selectedService.checklist_data).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{ fontSize: '1.25rem' }}>{value ? '✓' : '✗'}</span>
                        <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedService.notes && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Notes</h3>
                  <div style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
                    {selectedService.notes}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedService.photos && selectedService.photos.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>Photos ({selectedService.photos.length})</h3>
                  <div className="photo-preview-grid">
                    {selectedService.photos.map(photo => (
                      <div key={photo.photo_id} className="photo-preview">
                        <img src={photo.file_path} alt={photo.photo_type} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedService(null)}
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
