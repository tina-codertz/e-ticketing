
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-white px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} e-ticket. All rights reserved.
        </p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;