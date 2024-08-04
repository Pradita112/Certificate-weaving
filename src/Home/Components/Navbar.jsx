import React, { useState } from 'react';

import craftchainLogo from "../../assets/loo.png";
import SignIn from "./SignInModal";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const handleSignInModal = () => {
    setSignInModalOpen(true);
  };

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white'>
      <div className='flex items-center'>
        <img src={craftchainLogo} alt="CraftChain Logo" className="w-20 h-20" />
        <h1 className='text-3xl font-bold ml-4'>
          <span className="gold-text1">CRAFTCHAIN</span>
        </h1>
      </div>
      <ul className='hidden md:flex'>
        <li className='p-4'>Home</li>
        <li className='p-4'>Company</li>
        <li className='p-4'>Resources</li>
        <li className='p-4'>About</li>
        <li className='p-4'>Contact</li>
        <li className='p-4'>
          <button type="button" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded' onClick={handleSignInModal}>Sign In</button>
        </li>
      </ul>
      <div onClick={handleNav} className='block md:hidden'>
        <button className='text-white focus:outline-none'>
          {nav ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>
      <ul className={`${nav ? 'fixed' : 'hidden'} left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 md:hidden`}>
        <li className='p-4 border-b border-gray-600'>Home</li>
        <li className='p-4 border-b border-gray-600'>Company</li>
        <li className='p-4 border-b border-gray-600'>Resources</li>
        <li className='p-4 border-b border-gray-600'>About</li>
        <li className='p-4 border-b border-gray-600'>Contact</li>
        <li className='p-4'>
          <button type="button" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded' onClick={handleSignInModal}>Sign In</button>
        </li>
      </ul>

      <SignIn isOpen={signInModalOpen} onClose={() => setSignInModalOpen(false)} />
    </div>
  );
};

export default Navbar;
