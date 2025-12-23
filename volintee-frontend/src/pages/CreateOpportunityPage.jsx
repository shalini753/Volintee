import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOpportunity } from '../utils/api';


const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    availability: 'flexible',
    startDate: '',
    endDate: '',
    volunteersNeeded: '',
    skillsRequired: '',
    interests: '',
    requirements: '',
    image: null
  });

  const categories = [
    'Education', 'Health', 'Environment', 'Animal Welfare', 
    'Community Development', 'Arts & Culture', 'Crisis Support', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('availability', formData.availability);
      
      if (formData.startDate) data.append('startDate', formData.startDate);
      if (formData.endDate) data.append('endDate', formData.endDate);
      if (formData.volunteersNeeded) data.append('volunteersNeeded', formData.volunteersNeeded);
      
      
      // Location fields removed - using organization location


      // Array fields (comma separated strings -> arrays)
      if (formData.skillsRequired) {
        formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
          data.append('skillsRequired[]', skill);
        });
      }
      
      if (formData.interests) {
        formData.interests.split(',').map(s => s.trim()).filter(Boolean).forEach(interest => {
          data.append('interests[]', interest);
        });
      }

      if (formData.requirements) {
        formData.requirements.split(',').map(s => s.trim()).filter(Boolean).forEach(req => {
          data.append('requirements[]', req);
        });
      }

      if (formData.image) {
        data.append('opportunityImages', formData.image);
      }

      const response = await createOpportunity(data);
      
      if (response.success) {
        navigate(`/opportunities/${response.data._id}`);
      }
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setError(err.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 font-sans py-8">
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-accent-green/10 px-8 py-6 border-b border-accent-green/10">
            <h1 className="text-2xl font-bold text-gray-900">Create New Opportunity</h1>
            <p className="text-gray-600 mt-1">Share your cause and find amazing volunteers</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="e.g. Weekend Beach Cleanup"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="Describe what volunteers will be doing..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    name="volunteersNeeded"
                    value={formData.volunteersNeeded}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>
            </section>

            {/* Logistics */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Logistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Type *</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  required
                >
                  <option value="flexible">Flexible</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="both">Both</option>
                </select>
              </div>

            </section>

            {/* Details */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required (comma separated)</label>
                <input
                  type="text"
                  name="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="e.g. Teaching, First Aid, Driving"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Interests (comma separated)</label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="e.g. Education, Youth, Outdoors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="e.g. Must be 18+, Background check required"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm text-gray-600">Choose File</span>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                  {imagePreview && (
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="pt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/opportunities')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-accent-green text-white px-8 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOpportunityPage;
