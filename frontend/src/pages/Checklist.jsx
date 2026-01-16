import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { checklistAPI } from '../utils/api';

export default function Checklist() {
  const { locationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [checklistData, setChecklistData] = useState({});
  const [sectionNotes, setSectionNotes] = useState({});
  const [photos, setPhotos] = useState([]);
  const [confirmations, setConfirmations] = useState([false, false]);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChecklist();
  }, [locationId]);

  const loadChecklist = async () => {
    try {
      const response = await checklistAPI.getChecklist(locationId);
      setData(response.data);

      // Initialize header fields
      const initialHeaderData = {};
      response.data.checklist.config.header_fields?.forEach(field => {
        initialHeaderData[field.id] = '';
      });
      setHeaderData(initialHeaderData);

      // Initialize checklist data (all tasks start as null)
      const initialChecklistData = {};
      response.data.checklist.config.sections?.forEach(section => {
        section.tasks.forEach((task, index) => {
          const taskId = `${section.id}_task_${index}`;
          initialChecklistData[taskId] = null;
        });
      });
      setChecklistData(initialChecklistData);

      // Initialize section notes
      const initialNotes = {};
      response.data.checklist.config.sections?.forEach(section => {
        initialNotes[section.id] = '';
      });
      setSectionNotes(initialNotes);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (fieldId, value) => {
    setHeaderData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTaskChange = (taskId, value) => {
    setChecklistData(prev => ({ ...prev, [taskId]: value }));
  };

  const handleSectionNoteChange = (sectionId, value) => {
    setSectionNotes(prev => ({ ...prev, [sectionId]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const allHeaderFilled = data.checklist.config.header_fields.every(
      field => field.required ? headerData[field.id]?.trim() : true
    );
    if (!allHeaderFilled) {
      setError('Please fill in all required header fields');
      return;
    }

    const allTasksAnswered = Object.values(checklistData).every(v => v !== null);
    if (!allTasksAnswered) {
      setError('Please answer all checklist items (Complete, Incomplete, or N/A)');
      return;
    }

    if (photos.length < 3) {
      setError('Please upload at least 3 photos');
      return;
    }

    if (!confirmations.every(c => c)) {
      setError('Please check both confirmation boxes');
      return;
    }

    if (!signature.trim()) {
      setError('Please provide your signature');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('serviceId', data.service.id);
      submitData.append('checklistData', JSON.stringify({
        header: headerData,
        tasks: checklistData,
        sectionNotes,
        signature
      }));
      submitData.append('notes', Object.values(sectionNotes).filter(n => n).join('\n\n'));
      submitData.append('submittedBy', `${headerData.cleaner_first_name} ${headerData.cleaner_last_name} - ${headerData.cleaning_company_name}`);

      photos.forEach(photo => {
        submitData.append('photos', photo.file);
      });

      await checklistAPI.submitChecklist(locationId, submitData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit checklist');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Header />
        <div className="container container-narrow" style={{ paddingTop: 'var(--space-2xl)' }}>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Header />
        <div className="container container-narrow" style={{ paddingTop: 'var(--space-2xl)' }}>
          <div className="card text-center">
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>✓</div>
            <h1 style={{ color: 'var(--color-success)' }}>Checklist Submitted!</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
              Thank you for completing the service checklist. Your submission has been recorded.
            </p>
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ivrExpirationDate = data.ivr ? new Date(data.ivr.expirationDate) : null;
  const today = new Date();
  const daysUntilExpiration = ivrExpirationDate
    ? Math.ceil((ivrExpirationDate - today) / (1000 * 60 * 60 * 24))
    : null;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration < 0;
  const isNearExpiration = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration >= 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: 'var(--space-2xl)' }}>
      <Header />

      <div className="container container-narrow" style={{ paddingTop: 'var(--space-xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-md)' }}>{data.checklist.name}</h1>

        {/* IVR Expiration Warning */}
        {isExpired && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-xl)' }}>
            <strong>IVR Expired:</strong> This IVR ticket expired on {ivrExpirationDate.toLocaleDateString()}.
            Please contact OnSite for the updated IVR information.
          </div>
        )}
        {isNearExpiration && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-xl)' }}>
            <strong>IVR Expiring Soon:</strong> This IVR expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''} on {ivrExpirationDate.toLocaleDateString()}.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-xl)' }}>
              {error}
            </div>
          )}

          {/* Header Fields */}
          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
              {data.checklist.config.header_fields?.map(field => (
                <div key={field.id}>
                  <label className="form-label">
                    {field.label}{field.required && ' *'}
                  </label>
                  <input
                    type={field.type}
                    className="form-input"
                    value={headerData[field.id] || ''}
                    onChange={(e) => handleHeaderChange(field.id, e.target.value)}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Site Information (Read-only) */}
          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="card-title">SITE INFORMATION</h2>
            <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
              <div>
                <label className="form-label">Crash Champions Site #</label>
                <div className="form-input mono" style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}>
                  {data.location.id}
                </div>
              </div>
              <div>
                <label className="form-label">Internal WO Number</label>
                <div className="form-input mono" style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}>
                  {data.location.internalWo}
                </div>
              </div>
              <div>
                <label className="form-label">ServiceChannel IVR Tracking</label>
                <div className="form-input mono" style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}>
                  {data.ivr?.ticketNumber || 'N/A'}
                </div>
              </div>
              <div>
                <label className="form-label">Shop Address</label>
                <div className="form-input" style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}>
                  {data.location.address}, {data.location.city}, {data.location.state} {data.location.zip}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          {data.checklist.config.sections?.map(section => (
            <div key={section.id} className="card" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>
                {section.title}
              </h2>

              <div className="table-wrapper" style={{ marginBottom: 'var(--space-lg)' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>Task</th>
                      <th style={{ textAlign: 'center', width: '15%' }}>Complete</th>
                      <th style={{ textAlign: 'center', width: '17%' }}>Incomplete</th>
                      <th style={{ textAlign: 'center', width: '18%' }}>N/A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.tasks.map((task, index) => {
                      const taskId = `${section.id}_task_${index}`;
                      return (
                        <tr key={taskId}>
                          <td>{task}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="radio"
                              name={taskId}
                              value="complete"
                              checked={checklistData[taskId] === 'complete'}
                              onChange={() => handleTaskChange(taskId, 'complete')}
                              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="radio"
                              name={taskId}
                              value="incomplete"
                              checked={checklistData[taskId] === 'incomplete'}
                              onChange={() => handleTaskChange(taskId, 'incomplete')}
                              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="radio"
                              name={taskId}
                              value="na"
                              checked={checklistData[taskId] === 'na'}
                              onChange={() => handleTaskChange(taskId, 'na')}
                              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="form-label">CLEANING OR MAINTENANCE ITEMS TO REPORT</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={sectionNotes[section.id] || ''}
                  onChange={(e) => handleSectionNoteChange(section.id, e.target.value)}
                  placeholder="Enter any issues or notes for this section..."
                />
              </div>
            </div>
          ))}

          {/* Photos */}
          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>
              PHOTOS * (Minimum 3 required)
            </h2>

            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-xl)',
                textAlign: 'center',
                marginBottom: photos.length > 0 ? 'var(--space-xl)' : 0
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                📷 Upload Photos
              </label>
              <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-md)' }}>
                Click to select photos from your device
              </p>
            </div>

            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: 'relative' }}>
                    <img
                      src={photo.preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--color-border)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'var(--color-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '2rem',
                        height: '2rem',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        lineHeight: 1,
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-md)' }}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              {photos.length < 3 && ` (${3 - photos.length} more required)`}
            </p>
          </div>

          {/* Confirmations */}
          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmations[0]}
                  onChange={(e) => setConfirmations(prev => [e.target.checked, prev[1]])}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <span>Please confirm that all the information provided on this form has been completed to the best of your ability.</span>
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmations[1]}
                  onChange={(e) => setConfirmations(prev => [prev[0], e.target.checked])}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <span>I confirm that the information provided is accurate and complete.</span>
              </label>
            </div>
          </div>

          {/* Signature */}
          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="form-label">Cleaning Tech Signature *</label>
            <input
              type="text"
              className="form-input"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name as signature"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Submitting...' : 'Submit Checklist'}
          </button>
        </form>
      </div>
    </div>
  );
}
