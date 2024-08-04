import React, { useState, useEffect } from 'react';
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../backend/pinata";
import Marketplace from '../../backend/UpdateMarket.json';
import { useLocation } from "react-router";
import { ethers } from "ethers";
import Modal from '../Modal'; // Import the Modal component

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
    const [loading, setLoading] = useState(false); // Loading state
    const location = useLocation();
    const [signature, setSignature] = useState('');

    useEffect(() => {
        const ethPrice = formParams.price ? (formParams.price / ETH_TO_IDR).toFixed(6) : '';
        updateFormParams(prevState => ({
            ...prevState,
            ethPrice
        }));
    }, [formParams.price]);

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
            setFileURL(URL.createObjectURL(file)); // Set image preview
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

    async function OnChangeSecondFile(e) {
        const file = e.target.files[0];
        try {
            setSecondFileURL(URL.createObjectURL(file)); // Set image preview
            toggleButtonState(true);
            updateMessage("Uploading second image... please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if (response.success) {
                setSecondFileURL(response.pinataURL);
                updateMessage("");
            }
        } catch (e) {
            console.log("Error during second file upload", e);
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
            setLoading(true); // Start loading
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
            setLoading(false); // Stop loading
            toggleButtonState(false);
        }
    }

    function handleListNFT(e) {
        e.preventDefault();
        setModalVisible(true);
    }

    function handleModalClose() {
        setModalVisible(false);
        listNFT(); // Continue with the listing process
    }

    function extractCID(url) {
        const parts = url.split("/");
        return parts[parts.length - 1];
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
            {loading && (
                <div className="fixed inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center">
                    <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-16 h-16 animate-spin"></div>
                    <div className="mt-4 text-white text-lg">Loading...</div>
                </div>
            )}
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                <h3 className="text-center font-bold text-2xl text-black mb-6">Upload your NFT to the marketplace</h3>
                <form>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="price">Price (in Rupiah)</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 40,000 IDR" step="1000" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })} />
                        <p className="text-sm text-gray-500 mt-2">ETH Equivalent: {formParams.ethPrice} ETH</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                        <input type="file" onChange={OnChangeFile} />
                        {fileURL && <img src={fileURL} alt="NFT Preview" className="mt-4 w-32 h-32 object-cover rounded" />}
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2" htmlFor="image2">Upload Second Image (&lt;500 KB)</label>
                        <input type="file" onChange={OnChangeSecondFile} />
                        {secondFileURL && <img src={secondFileURL} alt="Second NFT Preview" className="mt-4 w-32 h-32 object-cover rounded" />}
                    </div>
                    <div className="text-red-500 text-center">{message}</div>
                    <button onClick={handleListNFT} className="font-bold mt-6 w-full bg-blue-500 text-white rounded p-2 shadow-lg hover:bg-blue-700 transition duration-300" id="list-button">
                        List NFT
                    </button>
                </form>
            </div>
            <Modal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                onSubmit={handleModalClose} // Call handleModalClose for submission
                nftDetails={{
                    name: formParams.name,
                    description: formParams.description,
                    secondImage: secondFileURL ? extractCID(secondFileURL) : ''
                }}
                onSignatureReady={handleSignatureReceived}
            />
        </div>
    );
}
