import React from 'react';
import { Link } from 'react-router-dom';

const OpportunityCard = ({ opportunity }) => {
  const {
    _id,
    title,
    organization,
    location,
    category,
    image,
    createdAt
  } = opportunity;

  // Format date
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-black uppercase tracking-wide">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          {organization?.logo && (
            <img src={organization.logo} alt={organization.organizationName} className="w-6 h-6 rounded-full object-cover" />
          )}
          <span className="text-sm text-gray-600 font-medium">
            {organization?.organizationName || 'Community Org'}
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 mt-auto pt-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location?.city || 'Remote'}, {location?.state || ''}
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {date}
          </div>
        </div>

        <Link 
          to={`/opportunities/${_id}`}
          className="w-full block text-center bg-gray-50 hover:bg-black hover:text-white text-gray-900 font-medium py-2.5 rounded-lg transition-colors duration-300 border border-gray-200 hover:border-transparent"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
