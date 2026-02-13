import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md py-6 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              © {new Date().getFullYear()} e-ticket. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;