import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyApplications, getMyOpportunitiesWithStats } from '../utils/api';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'volunteer') {
          const result = await getMyApplications();
          if (result.success) {
            setApplications(result.data);
          } else {
            setError(result.error);
          }
        } else if (user?.role === 'organization') {
          const result = await getMyOpportunitiesWithStats();
          if (result.success) {
            setOpportunities(result.data);
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
          {user?.role === 'organization' && (
            <Link to="/create-opportunity" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              + Create Opportunity
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {user?.role === 'volunteer' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">My Applications</h2>
            {applications.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {applications.map((app) => (
                  <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{app.opportunity.title}</h3>
                        <p className="text-sm text-gray-500">{app.opportunity.organization.organizationName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Link 
                      to={`/opportunities/${app.opportunity._id}`}
                      className="block w-full text-center py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-medium text-sm"
                    >
                      View Opportunity
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 mb-4">You haven't applied to any opportunities yet.</p>
                <Link to="/opportunities" className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Browse Opportunities
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">My Opportunities</h2>
            {opportunities.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((opp) => (
                  <div key={opp._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{opp.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        opp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {opp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{opp.stats?.totalApplications || 0}</p>
                        <p className="text-xs text-blue-600 font-medium uppercase">Total Applications</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">{opp.stats?.pendingApplications || 0}</p>
                        <p className="text-xs text-yellow-600 font-medium uppercase">Pending Review</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/opportunities/${opp._id}`}
                        className="flex-1 text-center py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/opportunities/${opp._id}/manage`}
                        className="flex-1 text-center py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 mb-4">You haven't posted any opportunities yet.</p>
                <Link to="/create-opportunity" className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Create Your First Opportunity
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
