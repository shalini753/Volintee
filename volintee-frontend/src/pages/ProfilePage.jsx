import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateProfile, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [],
    skills: [],
    availability: 'flexible',
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        zipCode: user.location?.zipCode || '',
        interests: user.interests || [],
        skills: user.skills || [],
        availability: user.availability || 'flexible',
      });
      if (user.profilePicture) {
        setPreviewUrl(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleArrayChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [field]: options }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    // Create FormData object for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('bio', formData.bio);
    data.append('availability', formData.availability);
    
    // Append location fields
    data.append('location[address]', formData.address);
    data.append('location[city]', formData.city);
    data.append('location[state]', formData.state);
    data.append('location[zipCode]', formData.zipCode);
    
    // Append arrays
    formData.interests.forEach(interest => data.append('interests[]', interest));
    formData.skills.forEach(skill => data.append('skills[]', skill));

    // Append profile picture if selected
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    const result = await updateProfile(data);
    
    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const interestOptions = ['Education', 'Health', 'Environment', 'Community', 'Animals', 'Arts', 'Technology', 'Sports'];
  const skillOptions = ['Teaching', 'First Aid', 'Gardening', 'Cooking', 'Programming', 'Design', 'Management', 'Communication'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/3 bg-white p-8 border-r border-gray-100 flex flex-col">
              <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-accent-green transition-colors mb-6 group">
                  <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
                
                <div className="relative inline-block group cursor-pointer w-full text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4 bg-gray-100 relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-serif font-bold text-gray-300 bg-gray-50">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <label htmlFor="profile-upload" className="absolute inset-0 cursor-pointer"></label>
                  <input 
                    id="profile-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">{user?.name}</h2>
                <p className="text-sm text-gray-500 capitalize text-center mt-1 bg-gray-100 inline-block px-3 py-1 rounded-full mx-auto block w-max">{user?.role}</p>
              </div>
              
              <nav className="space-y-2 flex-grow">
                <button className="w-full flex items-center px-4 py-3 bg-accent-green/10 text-accent-green rounded-xl font-medium transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>
                <button className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
                <button className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:w-2/3 p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Edit Profile</h1>
                {saved && (
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium animate-fade-in-down">
                    Saved Successfully
                  </span>
                )}
              </div>
              
              {authError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <div className="relative">
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all appearance-none"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                          <option value="both">Both</option>
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Bio Section */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </span>
                    About You
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all resize-none"
                      placeholder="Tell us a bit about yourself..."
                    ></textarea>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Location Section */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all"
                      placeholder="Street address, City, State"
                    />
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Interests & Skills Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </span>
                      Interests
                    </h3>
                    <div className="h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 custom-scrollbar">
                      {interestOptions.map(interest => (
                        <label key={interest} className="flex items-center space-x-3 p-2 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all mb-1">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.interests.includes(interest) ? 'bg-accent-green border-accent-green' : 'border-gray-300 bg-white'}`}>
                            {formData.interests.includes(interest) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            value={interest}
                            checked={formData.interests.includes(interest)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                              } else {
                                setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-sm font-medium text-gray-700">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      Skills
                    </h3>
                    <div className="h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 custom-scrollbar">
                      {skillOptions.map(skill => (
                        <label key={skill} className="flex items-center space-x-3 p-2 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all mb-1">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.skills.includes(skill) ? 'bg-accent-green border-accent-green' : 'border-gray-300 bg-white'}`}>
                            {formData.skills.includes(skill) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            value={skill}
                            checked={formData.skills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                              } else {
                                setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      saved ? 'bg-green-600' : 'bg-black hover:bg-gray-900'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : saved ? (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Saved Changes
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
