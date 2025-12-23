import React from 'react';

const FeatureItem = ({ icon, title, description }) => {
  return (
    <div className="relative p-6 rounded-xl transition-all duration-300 cursor-pointer group hover:bg-white hover:shadow-xl hover:-translate-y-1">
      {/* Background Brush Stroke for Hover State */}
      <div className="absolute inset-0 bg-accent-yellow/10 rounded-xl -z-10 transform rotate-1 scale-95 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"></div>
      
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 rounded-full bg-gray-50 text-gray-600 transition-colors duration-300 group-hover:bg-accent-yellow group-hover:text-black">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        
        <h3 className="font-serif text-xl font-bold text-gray-800 transition-colors group-hover:text-black">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700">
          {description}
        </p>
      </div>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      title: "Education",
      description: "Help students succeed through tutoring, mentoring, and after-school programs.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      )
    },
    {
      title: "Health",
      description: "Support hospitals, clinics, and community health initiatives.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>
        </svg>
      )
    },
    {
      title: "Environment",
      description: "Participate in cleanups, tree planting, and sustainability projects.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
        </svg>
      )
    },
    {
      title: "Community",
      description: "Assist food banks, shelters, and local community centers.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="px-8 pb-24 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold mb-4">Browse by Category</h2>
        <p className="text-gray-600">Find the perfect opportunity that matches your passion.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default Features;
