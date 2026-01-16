import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { dashboardAPI } from '../utils/api';

export default function Vendors() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [vendorTabs, setVendorTabs] = useState({}); // Track active tab per vendor
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc', vendorId: null, tab: null });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

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

  const setVendorTab = (vendorId, tab) => {
    setVendorTabs(prev => ({ ...prev, [vendorId]: tab }));
  };

  const getVendorTab = (vendorId) => {
    return vendorTabs[vendorId] || 'locations';
  };

  const handleSort = (vendorId, tab, key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.vendorId === vendorId && sortConfig.tab === tab && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction, vendorId, tab });
  };

  const getSortedData = (data, vendorId, tab) => {
    if (!sortConfig.key || sortConfig.vendorId !== vendorId || sortConfig.tab !== tab) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal instanceof Date || sortConfig.key.includes('date')) {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  };

  const SortIcon = ({ columnKey, vendorId, tab }) => {
    if (sortConfig.key !== columnKey || sortConfig.vendorId !== vendorId || sortConfig.tab !== tab) {
      return <span style={{ opacity: 0.3, marginLeft: '0.25rem' }}>↕</span>;
    }
    return <span style={{ marginLeft: '0.25rem' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vendor.subcontractor_name.toLowerCase().includes(search) ||
      vendor.subcontractor_id.toLowerCase().includes(search) ||
      vendor.email?.toLowerCase().includes(search) ||
      vendor.phone?.toLowerCase().includes(search)
    );
  });

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
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            {searchTerm && ` (filtered from ${vendors.length})`}
          </p>
        </div>

        {/* Search Box */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <input
            type="text"
            placeholder="Search vendors by name, ID, email, or phone..."
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {filteredVendors.map(vendor => (
            <div key={vendor.subcontractor_id} className="card">
              <div
                style={{
                  marginBottom: 'var(--space-lg)',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onClick={() => setSelectedVendor(selectedVendor?.subcontractor_id === vendor.subcontractor_id ? null : vendor)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <h2 className="card-title" style={{ marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  {vendor.subcontractor_name}
                  <span style={{ fontSize: '0.875rem', opacity: 0.5 }}>
                    {selectedVendor?.subcontractor_id === vendor.subcontractor_id ? '▼' : '▶'}
                  </span>
                </h2>
                <p className="text-secondary mono text-sm">{vendor.subcontractor_id}</p>
              </div>

              {/* Vendor Details (expandable) */}
              {selectedVendor?.subcontractor_id === vendor.subcontractor_id && (
                <div style={{
                  marginBottom: 'var(--space-lg)',
                  padding: 'var(--space-md)',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--color-primary)'
                }}>
                  <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>
                    Vendor Details
                  </h3>
                  <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
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
                    <div>
                      <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Total Locations
                      </div>
                      <div>{vendor.locations?.length || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Total Submissions
                      </div>
                      <div>{vendor.submissions?.length || 0}</div>
                    </div>
                  </div>
                </div>
              )}

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
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'locations', 'location_id')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Location ID <SortIcon columnKey="location_id" vendorId={vendor.subcontractor_id} tab="locations" />
                            </th>
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'locations', 'location_name')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Name <SortIcon columnKey="location_name" vendorId={vendor.subcontractor_id} tab="locations" />
                            </th>
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'locations', 'city')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              City, State <SortIcon columnKey="city" vendorId={vendor.subcontractor_id} tab="locations" />
                            </th>
                            <th style={{ width: '140px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedData(vendor.locations, vendor.subcontractor_id, 'locations').map(loc => (
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
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'submissions', 'location_name')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Location <SortIcon columnKey="location_name" vendorId={vendor.subcontractor_id} tab="submissions" />
                            </th>
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'submissions', 'submitted_date')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Submitted Date <SortIcon columnKey="submitted_date" vendorId={vendor.subcontractor_id} tab="submissions" />
                            </th>
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'submissions', 'ivr_ticket_number')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              IVR Number <SortIcon columnKey="ivr_ticket_number" vendorId={vendor.subcontractor_id} tab="submissions" />
                            </th>
                            <th
                              onClick={() => handleSort(vendor.subcontractor_id, 'submissions', 'photo_count')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              Photos <SortIcon columnKey="photo_count" vendorId={vendor.subcontractor_id} tab="submissions" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedData(
                            vendor.submissions.sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date)),
                            vendor.subcontractor_id,
                            'submissions'
                          ).map(sub => (
                            <tr
                              key={sub.submission_id}
                              onClick={() => viewSubmissionDetails(sub.submission_id)}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = ''}
                            >
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
