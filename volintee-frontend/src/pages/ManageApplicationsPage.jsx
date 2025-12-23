import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOpportunityApplications, updateApplicationStatus, getOpportunity } from '../utils/api';

const ManageApplicationsPage = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oppResponse, appsResponse] = await Promise.all([
          getOpportunity(id),
          getOpportunityApplications(id)
        ]);

        if (oppResponse.success) {
          setOpportunity(oppResponse.data);
        }
        
        if (appsResponse.success) {
          setApplications(appsResponse.data);
        } else {
          setError(appsResponse.error);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setProcessingId(applicationId);
    const result = await updateApplicationStatus(applicationId, newStatus);
    
    if (result.success) {
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } else {
      alert('Failed to update status: ' + result.error);
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Manage Applications
            </h1>
            <p className="text-gray-600 mt-1">
              For: <span className="font-semibold">{opportunity?.title}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {applications.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {app.volunteer.profilePicture ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={app.volunteer.profilePicture} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                {app.volunteer.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.volunteer.name}</div>
                            <div className="text-sm text-gray-500">{app.volunteer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={app.message}>
                          {app.message || 'No message provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'approved')}
                              disabled={processingId === app._id}
                              className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'rejected')}
                              disabled={processingId === app._id}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                          <span className="text-gray-400 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No applications received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplicationsPage;
