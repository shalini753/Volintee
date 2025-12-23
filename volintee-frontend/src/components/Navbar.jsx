import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full bg-primary/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 100 100" className="w-full h-full text-accent-green fill-current">
               <path d="M50 0 L100 50 L50 100 L0 50 Z" />
            </svg>
            <div className="absolute top-0 right-0 w-3 h-3 bg-accent-yellow rounded-full -mr-1 -mt-1"></div>
          </div>
          <span className="text-xl font-serif font-bold tracking-wide">Volintee</span>
        </Link>

        {/* Navigation Links - Removed as per user request */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/opportunities" className="hover:text-black transition-colors">Opportunities</Link>
          {user && (
            <Link to="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-gray-600 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100" title="Profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                Log in
              </Link>
              <Link to="/register" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
