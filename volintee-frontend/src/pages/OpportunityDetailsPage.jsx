import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOpportunity, createApplication, checkApplicationStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const OpportunityDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOpportunityAndStatus = async () => {
      try {
        const [oppResponse, statusResponse] = await Promise.all([
          getOpportunity(id),
          user && user.role === 'volunteer' ? checkApplicationStatus(id) : Promise.resolve({ hasApplied: false })
        ]);

        if (oppResponse.success) {
          setOpportunity(oppResponse.data);
        } else {
          setError('Failed to load opportunity details');
        }

        if (statusResponse.success && statusResponse.hasApplied) {
          setApplicationStatus(statusResponse.status);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('An error occurred while fetching details');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunityAndStatus();
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await createApplication({
      opportunityId: id,
      message: applicationMessage
    });

    if (result.success) {
      setApplicationStatus('pending');
      setShowApplyModal(false);
      // Optional: Show success toast
    } else {
      alert(result.error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mb-8">{error || 'Opportunity not found'}</p>
          <Link to="/opportunities" className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-all">
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    organization,
    description,
    location,
    startDate,
    endDate,
    volunteersNeeded,
    skillsRequired,
    interests,
    images,
  } = opportunity;

  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen pb-20">
      
      {/* Hero Section with Dark Background */}
      <div className="bg-emerald-900 text-white pb-32 pt-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-emerald-400 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              to="/opportunities" 
              className="inline-flex items-center text-emerald-100 hover:text-white transition-colors font-medium group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Opportunities
            </Link>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-700 text-emerald-100 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              {opportunity.category}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight tracking-tight">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 text-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                    <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold mb-0.5">Organization</p>
                    <p className="font-medium text-lg text-white">{organization?.organizationName || 'Unknown Organization'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                    <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold mb-0.5">Location</p>
                    <p className="font-medium text-lg text-white">{location?.city}, {location?.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Image Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden mb-8 border border-gray-100">
                <div className="relative h-96 bg-gray-100">
                    {images && images.length > 0 ? (
                    <img 
                        src={images[0]} 
                        alt={title} 
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span className="text-8xl opacity-20">🤝</span>
                    </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif flex items-center">
                    <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 text-lg">
                        📝
                    </span>
                    About this Opportunity
                </h3>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  <p className="whitespace-pre-line">{description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                 {/* Skills Card */}
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                        Skills Required
                    </h4>
                    {skillsRequired && skillsRequired.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skillsRequired.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100">
                                {skill}
                            </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No specific skills listed.</p>
                    )}
                 </div>

                 {/* Interests Card */}
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </span>
                        Related Interests
                    </h4>
                    {interests && interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest, index) => (
                            <span key={index} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold border border-purple-100">
                                {interest}
                            </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No specific interests listed.</p>
                    )}
                 </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-8">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900 font-serif">Details</h3>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wide">Info</span>
              </div>
              
              <div className="space-y-8 mb-8">
                {/* Date */}
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex items-center justify-center text-gray-400 mr-4 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {startDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Flexible Schedule'}
                    </p>
                  </div>
                </div>
                
                {/* Availability */}
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex items-center justify-center text-gray-400 mr-4 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Availability</p>
                    <p className="font-semibold text-gray-900 text-lg capitalize">{opportunity.availability}</p>
                  </div>
                </div>

                {/* Volunteers */}
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex items-center justify-center text-gray-400 mr-4 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Volunteers Needed</p>
                    <p className="font-semibold text-gray-900 text-lg">{volunteersNeeded} people</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex items-center justify-center text-gray-400 mr-4 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Location</p>
                    <p className="font-semibold text-gray-900 text-lg">{location?.address}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{location?.city}, {location?.state} {location?.zipCode}</p>
                  </div>
                </div>
              </div>

              {user?.role === 'volunteer' && (
                <>
                  {applicationStatus ? (
                    <button disabled className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold cursor-not-allowed text-lg flex items-center justify-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Applied ({applicationStatus})
                      </span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowApplyModal(true)}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-1 text-lg relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                          Apply Now
                          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                      </span>
                    </button>
                  )}
                </>
              )}
              
              <p className="text-xs text-center text-gray-400 mt-6 leading-relaxed">
                By applying, you agree to share your profile with <span className="font-medium text-gray-900">{organization?.organizationName}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Apply for Opportunity</h3>
            <p className="text-gray-600 mb-6">
              Send a brief message to <span className="font-semibold text-gray-900">{organization?.organizationName}</span> about why you're interested.
            </p>
            <form onSubmit={handleApply}>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 mb-6 resize-none"
                rows="4"
                placeholder="I'm excited to help because..."
                required
              ></textarea>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailsPage;
