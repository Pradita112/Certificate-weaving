import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import verifySig from '../backend/VerifySignature.json';
import { uploadJSONToIPFS } from '../backend/pinata';

export default function Modal({ isVisible, onClose, onSubmit, nftDetails,onSignatureReady }) {
    const [messageHash, setMessageHash] = useState(null);
    const [signature, setSignature] = useState(null);
    const [signatureIPFSURL, setSignatureIPFSURL] = useState(null);

    useEffect(() => {
        const getMessageHash = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(verifySig.address, verifySig.abi, provider);
                const hash = await contract.getMessageHash(nftDetails.name, nftDetails.description, nftDetails.secondImage);
                setMessageHash(hash);
            } catch (error) {
                console.error('Error getting message hash:', error);
            }
        };

        getMessageHash();
    }, [nftDetails, verifySig.address, verifySig.abi]);
    function handleSignatureReady(signature) {
        // Call the callback function with the signature
        onSignatureReady(signature);
    }

    const signMessageHash = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
            setSignature(signature);

            // Upload signature, name, description, and CID to IPFS
            const data = {
                signature,
                name: nftDetails.name,
                description: nftDetails.description,
                cid: nftDetails.secondImage
            };
            const signatureIPFSURL = await uploadJSONToIPFS(data);
            setSignatureIPFSURL(signatureIPFSURL.pinataURL);
            handleSignatureReady(signature);
        } catch (error) {
            console.error('Error signing message hash:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Confirm NFT Details</h2>
                <p><strong>Name:</strong> {nftDetails.name}</p>
                <p><strong>Description:</strong> {nftDetails.description}</p>
                <p><strong>Image CID:</strong> {nftDetails.secondImage}</p>

                {messageHash && (
                    <div>
                        <p><strong>Message Hash:</strong> {messageHash}</p>
                        <button onClick={signMessageHash} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                            Sign Message Hash
                        </button>
                    </div>
                )}

                {signature && (
                    <div>
                        <p><strong>Signature:</strong> {signature}</p>
                        {signatureIPFSURL && <p><strong>Signature IPFS URL:</strong> {signatureIPFSURL}</p>}
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                        Close
                    </button>
                    <button onClick={onSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
                        Confirm and Submit
                    </button>
                </div>
            </div>
        </div>
    );
}