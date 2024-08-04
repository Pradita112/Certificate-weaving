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
    <div className='flex justify-between items-center h-24 max-w-[1240px] text-white'>
      <h1 className='flex items-center text-3xl font-bold'>
        <img src={craftchainLogo} alt="CraftChain Logo" className="w-22 h-20" /> 
        <span className="gold-text1">CRAFTCHAIN</span>
      </h1>
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
       
      </div>
      <ul className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500' : 'ease-in-out duration-500 fixed left-[-100%]'}>
        <h1 className='w-full text-3xl font-bold text-[#00df9a] m-4'>REACT.</h1>
        <li className='p-4 border-b border-gray-600'>Home</li>
        <li className='p-4 border-b border-gray-600'>Company</li>
        <li className='p-4 border-b border-gray-600'>Resources</li>
        <li className='p-4 border-b border-gray-600'>About</li>
        <li className='p-4'>Contact</li>
      </ul>

      <SignIn isOpen={signInModalOpen} onClose={() => setSignInModalOpen(false)} />
    </div>
  );
};

export default Navbar;
