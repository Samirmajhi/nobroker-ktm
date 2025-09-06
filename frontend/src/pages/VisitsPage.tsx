import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchVisits, updateVisitStatus, cancelVisit, submitVisitDecision } from '../store/slices/visitsSlice';
import { Visit } from '../store/slices/visitsSlice';

const VisitsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { visits, loading, error } = useSelector((state: RootState) => state.visits);
  const dispatch = useDispatch<AppDispatch>();
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'interested' | 'not_interested' | 'undecided'>('interested');
  const [decisionNotes, setDecisionNotes] = useState('');

  useEffect(() => {
    dispatch(fetchVisits());
  }, [dispatch]);

  const filteredVisits = visits.filter(visit => {
    if (filterStatus === 'all') return true;
    return visit.status === filterStatus;
  });

  const handleStatusUpdate = async (visitId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const updated = await dispatch(updateVisitStatus({ visit_id: visitId, status })).unwrap();
      // If a visit is marked completed, immediately prompt for decision
      if (status === 'completed') {
        setSelectedVisit(updated);
        setShowDecisionModal(true);
      }
    } catch (error) {
      console.error('Failed to update visit status:', error);
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    try {
      await dispatch(cancelVisit(visitId)).unwrap();
      setShowCancelModal(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error('Failed to cancel visit:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedVisit || !feedback.trim()) return;
    
    try {
      await dispatch(updateVisitStatus({ 
        visit_id: selectedVisit.visit_id, 
        status: selectedVisit.status,
        feedback 
      })).unwrap();
      setShowFeedbackModal(false);
      setSelectedVisit(null);
      setFeedback('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!selectedVisit) return;
    try {
      await dispatch(submitVisitDecision({
        visit_id: selectedVisit.visit_id,
        decision,
        notes: decisionNotes.trim() || undefined,
      })).unwrap();
      setShowDecisionModal(false);
      setSelectedVisit(null);
      setDecision('interested');
      setDecisionNotes('');
    } catch (error) {
      console.error('Failed to submit decision:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const needsDecision = (visit: Visit) => {
    if (visit.status !== 'completed') return false;
    if (user?.role === 'tenant') {
      return !visit.tenant_decision || visit.tenant_decision === 'undecided';
    }
    if (user?.role === 'owner') {
      return !visit.owner_decision || visit.owner_decision === 'undecided';
    }
    return false;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Visits</h1>
          <p className="mt-2 text-gray-600">
            Manage your scheduled property visits and view visit history
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visits.filter(v => v.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Visits</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visits List */}
        {filteredVisits.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No visits found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' 
                ? 'You haven\'t scheduled any property visits yet.'
                : `No ${filterStatus} visits found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVisits.map((visit) => (
              <div key={visit.visit_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(visit.status)}`}>
                      {getStatusText(visit.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(visit.visit_datetime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {visit.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(visit.visit_id, 'completed')}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setShowCancelModal(true);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedVisit(visit);
                        setShowFeedbackModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      {visit.tenant_feedback ? 'Edit Feedback' : 'Add Feedback'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Details</h3>
                    <p className="text-gray-600">Property ID: {visit.listing_id}</p>
                    {/* You can add more property details here */}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Information</h3>
                    <p className="text-gray-600">Tenant ID: {visit.tenant_id}</p>
                    {visit.rep_id && <p className="text-gray-600">Representative ID: {visit.rep_id}</p>}
                    {visit.visit_notes && (
                      <p className="text-gray-600 mt-2">
                        <strong>Notes:</strong> {visit.visit_notes}
                      </p>
                    )}
                    {(visit.tenant_decision || visit.owner_decision) && (
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        {visit.tenant_decision && (
                          <p>
                            <strong>Tenant decision:</strong> {visit.tenant_decision.replace('_', ' ')}
                            {visit.tenant_decision_notes ? ` – ${visit.tenant_decision_notes}` : ''}
                          </p>
                        )}
                        {visit.owner_decision && (
                          <p>
                            <strong>Owner decision:</strong> {visit.owner_decision.replace('_', ' ')}
                            {visit.owner_decision_notes ? ` – ${visit.owner_decision_notes}` : ''}
                          </p>
                        )}
                      </div>
                    )}
                    {needsDecision(visit) && (
                      <div className="mt-3 p-3 rounded-md bg-indigo-50 border border-indigo-200">
                        <p className="text-sm text-indigo-800 mb-2">
                          Please submit your decision for this completed visit.
                        </p>
                        <button
                          onClick={() => { setSelectedVisit(visit); setShowDecisionModal(true); }}
                          className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Submit Decision
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {visit.tenant_feedback && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                    <p className="text-gray-600">{visit.tenant_feedback}</p>
                  </div>
                )}

                {/* Decision Actions */}
                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={() => { setSelectedVisit(visit); setShowDecisionModal(true); }}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Submit Decision
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Visit Modal */}
      {showCancelModal && selectedVisit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Visit</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel this visit scheduled for {formatDateTime(selectedVisit.visit_datetime)}?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => handleCancelVisit(selectedVisit.visit_id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedVisit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback about this visit..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedVisit(null);
                    setFeedback('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedVisit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Decision</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your decision</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              >
                <option value="interested">Interested</option>
                <option value="not_interested">Not interested</option>
                <option value="undecided">Undecided</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes..."
              />
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => { setShowDecisionModal(false); setSelectedVisit(null); }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecisionSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitsPage;
