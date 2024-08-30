import React, { useState, useEffect } from 'react';
import craftchainLogo from "../assets/loo.png";
import SignIn from "../Home/Components/SignInModal";
import { Link, useLocation } from 'react-router-dom';
import { ethers } from "ethers";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [connected, toggleConnect] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState('0x');
  const [ethereumInitialized, setEthereumInitialized] = useState(false);

  const handleSignInModal = () => {
    setSignInModalOpen(true);
  };

  useEffect(() => {
    const initEthereum = async () => {
      if (window.ethereum) {
        setEthereumInitialized(true);
        if (window.ethereum.isConnected()) {
          await getAddress();
          toggleConnect(true);
          updateButton();
        }
        window.ethereum.on('accountsChanged', function (accounts) {
          window.location.replace(location.pathname);
        });
      } else {
        console.error("window.ethereum is not available");
      }
    };

    initEthereum();
  }, []);

  async function getAddress() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
    }
  }

  function updateButton() {
    const ethereumButton = document.querySelector('.navbar-connect-button');
    if (ethereumButton) {
      ethereumButton.textContent = "Connected";
      ethereumButton.classList.remove("hover:bg-blue-70", "bg-blue-500");
      ethereumButton.classList.add("hover:bg-green-70", "bg-green-500");
    }
  }

  async function connectToWebsite() {
    if (!ethereumInitialized) {
      console.error("Ethereum is not initialized");
      return;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => {
        updateButton();
        getAddress();
        toggleConnect(true);
        window.location.replace(location.pathname);
      });
  }

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto text-white px-4 relative z-50'>
      <h1 className='flex items-center text-xl sm:text-3xl font-bold'>
        <img src={craftchainLogo} alt="CraftChain Logo" className="w-16 h-16 sm:w-22 sm:h-20" />
        <span className="gold-text1 ml-2">CRAFTCHAIN</span>
      </h1>
      <ul className='hidden md:flex'>
        <li className='p-4'>
          <Link to="/cart" className='hover:underline'>Marketplace</Link>
        </li>
        <li className='p-4'>
          <Link to="/profile" className='hover:underline'>Profile</Link>
        </li>
        <li className='p-4'>
          {connected ? (
            <button type="button" className='bg-green-500 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded navbar-connect-button'>Connected</button>
          ) : (
            <button type="button" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded enableEthereumButton navbar-connect-button' onClick={connectToWebsite}>Connect</button>
          )}
        </li>
      </ul>
      <div onClick={handleNav} className='block md:hidden'>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
      <ul className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 z-50' : 'ease-in-out duration-500 fixed left-[-100%]'}>
        <li className='p-4 border-b border-gray-600'><Link to="/market" onClick={handleNav}>Marketplace</Link></li>
        <li className='p-4 border-b border-gray-600'><Link to="/profile" onClick={handleNav}>Profile</Link></li>
        <li className='p-4'><Link to="/contact" onClick={handleNav}>Contact</Link></li>
      </ul>

      <SignIn isOpen={signInModalOpen} onClose={() => setSignInModalOpen(false)} />
    </div>
  );
};

export default Navbar;
