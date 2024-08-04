// Signature.js

import React, { useState } from 'react';
import { ethers } from 'ethers';
import verifySig from '../backend/VerifySignature.json';

const Signature = () => {
  const [signer, setSigner] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [cid, setCid] = useState('');
  const [signature, setSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const verifySignature = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(verifySig.address, verifySig.abi, provider);
      const isValid = await contract.verify(signer, nftName, nftDescription, cid, signature);
      setVerificationResult(isValid);
    } catch (error) {
      console.error('Error verifying signature:', error);
      setVerificationResult(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <form className="bg-white bg-opacity-50 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
        <h3 className="text-center font-bold text-gray-800 mb-8 text-2xl">Verify Signature</h3>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signer">Signer Address</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="signer"
            type="text"
            placeholder="Enter Signer Address"
            value={signer}
            onChange={(e) => setSigner(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nftName">NFT Name</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nftName"
            type="text"
            placeholder="Enter NFT Name"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nftDescription">NFT Description</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nftDescription"
            type="text"
            placeholder="Enter NFT Description"
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cid">CID</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="cid"
            type="text"
            placeholder="Enter CID"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signature">Signature</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="signature"
            type="text"
            placeholder="Enter Signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>
        <button
          onClick={verifySignature}
          className="bg-gray-700 hover:bg-gray-900 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          type="button"
        >
          Verify Signature
        </button>
        {verificationResult !== null && (
          <p className="mt-4 text-center text-xl text-gray-800">
            <strong>Verification Result:</strong> {verificationResult.toString()}
          </p>
        )}
      </form>
    </div>
  );
};

export default Signature;
