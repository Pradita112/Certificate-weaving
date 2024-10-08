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
        return bytecode;
    } catch (error) {
        console.error("Error checking contract bytecode:", error);
        return null;
    }
}

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '', ethPrice: '' });
    const [fileURL, setFileURL] = useState(null);
    const [secondFileURL, setSecondFileURL] = useState(null);
    const [message, updateMessage] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState('');
    const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

    useEffect(() => {
        const ethPrice = formParams.price ? (formParams.price / ETH_TO_IDR).toFixed(6) : '';
        updateFormParams(prevState => ({ ...prevState, ethPrice }));
    }, [formParams.price]);

    function dataURLToFile(dataURL, filename) {
        const [header, data] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
    
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
    
        return new File([array], filename, { type: mime });
    }

    async function handleSignatureReceive(signatureDataURL) {
        setShowSignatureCanvas(false);
        const signatureFile = dataURLToFile(signatureDataURL, 'signature.png');
        setSecondFileURL(URL.createObjectURL(signatureFile));

        try {
            const response = await uploadFileToIPFS(signatureFile);
            if (response.success) {
                setSecondFileURL(response.pinataURL);
            }
        } catch (error) {
            console.error("Error uploading signature image:", error);
        }
    }

    async function toggleButtonState(disable) {
        const listButton = document.getElementById("list-button");
        if (listButton) {
            listButton.disabled = disable;
            listButton.classList.toggle("bg-opacity-50", disable);
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setFileURL(URL.createObjectURL(file));
            toggleButtonState(true);
            updateMessage("Uploading image... please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if (response.success) {
                setFileURL(response.pinataURL);
                updateMessage("");
            }
        } catch (error) {
            console.error("Error during file upload", error);
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
        } catch (error) {
            console.error("Error uploading JSON metadata:", error);
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
            window.location.replace("/market");
        } catch (error) {
            alert("Upload error: " + error.message);
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
                setShowSignatureCanvas(true);
            } else {
                listNFT();
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
        <div className="bg-gray-100 min-h-screen flex flex-col items-center py-5 sm:py-10">
            {loading && (
                <div className="fixed inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center">
                    <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-12 h-12 sm:w-16 sm:h-16 animate-spin"></div>
                    <div className="mt-2 sm:mt-4 text-white text-sm sm:text-lg">Loading...</div>
                </div>
            )}
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8 max-w-lg w-full">
                <h3 className="text-center font-bold text-xl sm:text-2xl text-black mb-4 sm:mb-6">Upload Your Work</h3>
                <form>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-1 sm:mb-2" htmlFor="name">Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            placeholder="Axie#4563"
                            onChange={e => updateFormParams({ ...formParams, name: e.target.value })}
                            value={formParams.name}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-1 sm:mb-2" htmlFor="description">Description</label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            cols="40"
                            rows="4 sm:rows-5"
                            id="description"
                            placeholder="Axie Infinity Collection"
                            value={formParams.description}
                            onChange={e => updateFormParams({ ...formParams, description: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-1 sm:mb-2" htmlFor="price">Price (in Rupiah)</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="number"
                            placeholder="Min 40,000 IDR"
                            step="1000"
                            value={formParams.price}
                            onChange={e => updateFormParams({ ...formParams, price: e.target.value })}
                        />
                        <p className="text-xs mt-1">Price in ETH: {formParams.ethPrice}</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-1 sm:mb-2">
                            Upload Image Woven
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <button
                                type="button"
                                onClick={() => document.getElementById("file-upload-gallery").click()}
                                className="bg-gray-500 hover:bg-gray-700 text-black font-bold py-2 px-4 rounded"
                            >
                                Select from Gallery
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById("file-upload-camera").click()}
                                className="bg-gray-500 hover:bg-gray-700 text-black font-bold py-2 px-4 rounded"
                            >
                                Take a Photo
                            </button>
                        </div>
                        <input
                            id="file-upload-gallery"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <input
                            id="file-upload-camera"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {fileURL && <img src={fileURL} alt="NFT preview" className="mt-2 max-w-full h-auto" />}
                    </div>
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => setShowSignatureCanvas(true)}
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Signature
                        </button>
                    </div>
                    {showSignatureCanvas && <SignatureCanvas onSignatureReceive={handleSignatureReceive} />}
                    <div className="mb-4">
                        {secondFileURL && <p className="text-sm text-gray-600">Second image uploaded</p>}
                    </div>
                    <button
                        id="list-button"
                        type="submit"
                        onClick={handleListNFT}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        List NFT
                    </button>
                    <p className="text-red-500 mt-4">{message}</p>
                </form>
            </div>
            <Modal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                onSubmit={handleModalClose}
                nftDetails={{
                    name: formParams.name,
                    description: formParams.description,
                    secondImage: secondFileURL ? extractCID(secondFileURL) : ''
                }}
                onSignatureReady={setSignature}
            />
        </div>
    );
}
