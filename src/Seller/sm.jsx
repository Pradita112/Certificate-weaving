import React, { useState, useEffect } from 'react';
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../backend/pinata";
import Marketplace from '../../backend/UpdateMarket.json';
import { ethers } from "ethers";
import Modal from '../Modal';
import SignatureCanvas from '../SignatureCanvas';

const ETH_TO_IDR = 40000000; // 1 ETH = 40,000,000 IDR

async function checkContractBytecode(provider, exchangeAddress) {
    try {
        const bytecode = await provider.getCode(exchangeAddress);
        console.log("Contract Bytecode:", bytecode);
        return bytecode;
    } catch (error) {
        console.error("Error checking contract bytecode:", error);
        return null;
    }
}

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const [secondFileURL, setSecondFileURL] = useState(null);
    const [message, updateMessage] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState('');
    const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

    useEffect(() => {
        const ethPrice = formParams.price ? (formParams.price / ETH_TO_IDR).toFixed(6) : '';
        updateFormParams(prevState => ({
            ...prevState,
            ethPrice
        }));
    }, [formParams.price]);

    function dataURLToFile(dataURL, filename) {
        const [header, data] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = [];
    
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
    
        return new File([new Uint8Array(array)], filename, { type: mime });
    }

    async function handleSignaturesecond(signatureDataURL) {
        setShowSignatureCanvas(false);
    
        // Convert the data URL to a PNG file
        const signatureFile = dataURLToFile(signatureDataURL, 'signature.png');
        setSecondFileURL(URL.createObjectURL(signatureFile));
    
        try {
            // Upload the PNG file to IPFS
            const response = await uploadFileToIPFS(signatureFile);
            if (response.success) {
                setSecondFileURL(response.pinataURL);
            }
        } catch (error) {
            console.error("Error uploading signature image:", error);
        }
    }
    function handleSignatureReceived(signature) {
        setSignature(signature); // Save the signature in state
    }

    async function toggleButtonState(disable) {
        const listButton = document.getElementById("list-button");
        if (listButton) {
            listButton.disabled = disable;
            listButton.classList.toggle("bg-opacity-50", disable);
        }
    }

    async function OnChangeFile(e) {
        const file = e.target.files[0];
        try {
            setFileURL(URL.createObjectURL(file));
            toggleButtonState(true);
            updateMessage("Uploading image... please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if (response.success) {
                setFileURL(response.pinataURL);
                updateMessage("");
            }
        } catch (e) {
            console.log("Error during file upload", e);
        } finally {
            toggleButtonState(false);
        }
    }

    async function uploadMetadataToIPFS() {
        const { name, description, price, ethPrice } = formParams;
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        const nftJSON = {
            name, description, price: ethPrice, image: fileURL, secondImage: secondFileURL, signature, creatorAddress: addr
        }

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success) {
                return response.pinataURL;
            }
        } catch (e) {
            console.log("Error uploading JSON metadata:", e);
        }
    }

    async function listNFT() {
        try {
            setLoading(true);
            const metadataURL = await uploadMetadataToIPFS();
            if (metadataURL === -1) return;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            toggleButtonState(true);
            updateMessage("Uploading NFT (takes 5 mins)... please don't click anything!");

            const bytecode = await checkContractBytecode(provider, Marketplace.address);
            if (bytecode === null) return;

            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseUnits(formParams.ethPrice, 'ether');
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();

            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
            const transactionReceipt = await transaction.wait();
            const transactionHash = transactionReceipt.transactionHash;
            const signature = await signer.signMessage(transactionHash);
            setSignature(signature);

            alert("Successfully listed your NFT!");
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '', ethPrice: '' });
            window.location.replace("/");
        } catch (e) {
            alert("Upload error: " + e);
        } finally {
            setLoading(false);
            toggleButtonState(false);
        }
    }

    function handleListNFT(e) {
        e.preventDefault();
        if (secondFileURL) {
            setModalVisible(true);
        } else {
            if (showSignatureCanvas) {
                setShowSignatureCanvas(true); // Open canvas if needed
            } else {
                listNFT(); // Continue with the listing process
            }
        }
    }

    function handleModalClose() {
        setModalVisible(false);
        if (!showSignatureCanvas) {
            listNFT();
        }
    }

    function extractCID(url) {
        const parts = url.split("/");
        return parts[parts.length - 1];
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
            {loading && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex items-center justify-center text-white">
                    <span>Loading...</span>
                </div>
            )}
            <form onSubmit={handleListNFT} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">List Your NFT</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={formParams.name}
                        onChange={(e) => updateFormParams({ ...formParams, name: e.target.value })}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formParams.description}
                        onChange={(e) => updateFormParams({ ...formParams, description: e.target.value })}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Price (IDR)</label>
                    <input
                        type="number"
                        value={formParams.price}
                        onChange={(e) => updateFormParams({ ...formParams, price: e.target.value })}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={OnChangeFile}
                        className="mt-1 block w-full"
                    />
                    {fileURL && <img src={fileURL} alt="NFT" className="mt-4 w-32 h-32 object-cover" />}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Upload Signature Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setShowSignatureCanvas(true)}
                        className="mt-1 block w-full"
                    />
                    {secondFileURL && <img src={secondFileURL} alt="Signature" className="mt-4 w-32 h-32 object-cover" />}
                </div>
                {message && <p className="text-red-500 mb-4">{message}</p>}
                <button
                    type="submit"
                    id="list-button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    List NFT
                </button>
            </form>
            {isModalVisible && (
                <Modal
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleModalClose}
                    nftDetails={{
                        name: formParams.name,
                        description: formParams.description,
                        secondImage: secondFileURL ? extractCID(secondFileURL) : ''
                    }}
                    onSignatureReady={handleSignatureReceived}
                />
            )}
        </div>
    );
}
