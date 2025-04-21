import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Header = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="w-full bg-white bg-opacity-70 backdrop-blur-md sticky top-0 z-50 shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="mb-4 md:mb-0 flex items-center">
              <img src="/logo.png" alt="DetailPic Logo" className="h-16 w-auto mr-4" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text transition-all duration-300 hover:from-pink-500 hover:to-purple-600">
                  DetailPic
                </h1>
                <p className="text-gray-600 mt-1">Generate beautiful product detail images for your listings</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'transform rotate-90' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className={`w-full md:w-auto transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 md:max-h-screen opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'}`}>
            <Tabs 
              selectedIndex={activeTab} 
              onSelect={(index) => {
                setActiveTab(index);
                setMobileMenuOpen(false);
              }}
              className="w-full"
            >
              <TabList className="flex border-b border-gray-200">
                <Tab 
                  className="px-6 py-2 text-center cursor-pointer transition-all duration-200 relative hover:bg-gray-50 rounded-t-md"
                  selectedClassName="text-blue-600 border-b-2 border-blue-600 font-medium bg-blue-50"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-bold">eBay</span>
                  </div>
                </Tab>
                <Tab 
                  className="px-6 py-2 text-center cursor-pointer transition-all duration-200 relative hover:bg-gray-50 rounded-t-md"
                  selectedClassName="text-green-600 border-b-2 border-green-600 font-medium bg-green-50"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">eBay Review</span>
                  </div>
                </Tab>
              </TabList>
            </Tabs>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
