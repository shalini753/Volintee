import React from 'react';

const Hero = () => {
  return (
    <section className="relative px-8 pt-12 pb-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column: Text Content */}
      <div className="z-10">
        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-8 text-black">
          Connect with <br />
          <span className="relative inline-block">
            causes that
            <span className="absolute bottom-2 left-0 w-full h-3 bg-accent-yellow/40 -z-10 transform -rotate-1"></span>
          </span> need <br />
          you.
        </h1>
        
        <p className="text-gray-600 text-lg max-w-md mb-10 leading-relaxed">
          Find local volunteering opportunities that match your skills and interests.
          Make a real difference in your community today.
        </p>
        
        <div className="flex items-center gap-6">
          <button className="bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Find Opportunities
          </button>
          <button className="flex items-center gap-2 font-medium text-black hover:text-gray-600 transition-colors group">
            For Organizations
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Column: Visual Composition */}
      <div className="relative h-[500px] w-full flex items-center justify-center">
        {/* Abstract Map Shape / Mask Placeholder */}
        <div className="relative w-full h-full max-w-md mx-auto">
           {/* Background decorative blobs - refined opacity and blur */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200/60 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
           <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-accent-yellow/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 right-20 w-72 h-72 bg-accent-green/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
           
           {/* Main Image Container with Mask (Simulated) */}
           <div className="relative w-full h-full overflow-hidden rounded-3xl bg-gray-100 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-700 ease-out hover:shadow-3xl">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop" 
                alt="Volunteers working together" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
           </div>

           {/* Floating Stat - Smoother bounce */}
           <div className="absolute bottom-10 -right-4 md:-right-12 bg-white p-5 rounded-2xl shadow-xl z-20 flex items-center gap-4 animate-bounce-slow hover:scale-105 transition-transform duration-300">
              <div className="relative flex items-center justify-center w-16 h-16 bg-accent-yellow rounded-full font-serif font-bold text-xl shadow-inner">
                500+
              </div>
              <div className="text-sm font-medium leading-tight text-gray-800">
                Volunteers <br/>
                Connected
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
