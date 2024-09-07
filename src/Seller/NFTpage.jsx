import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useParams, Link } from 'react-router-dom';
import MarketplaceJSON from "../backend/UpdateMarket.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../backend/utils";
import { ethers } from "ethers";

export default function NFTPage() {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [loading, setLoading] = useState(true); // Loading state
    const [resellPrice, setResellPrice] = useState(""); // State for resell price
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    const params = useParams();
    const tokenId = params.tokenId;

    async function getNFTData(tokenId) {
        try {
            setLoading(true); // Start loading
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

            let tokenURI = await contract.tokenURI(tokenId);
            const listedToken = await contract.getListedTokenForId(tokenId);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);

            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let previousOwner = listedToken.seller !== ethers.constants.AddressZero ? listedToken.seller : "";

            let item = {
                price: meta.price,
                tokenId: tokenId,
                seller: previousOwner,
                owner: listedToken.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                currentlyListed: listedToken.currentlyListed
            };

            updateData(item);
            updateDataFetched(true);
            updateCurrAddress(addr);
        } catch (e) {
            console.error("Error fetching NFT data:", e);
        } finally {
            setLoading(false); // Stop loading
        }
    }

    async function buyNFT(tokenId) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            updateMessage("Buying the NFT... Please Wait (Up to 5 mins)");

            let transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();

            alert('You successfully bought the NFT!');
            updateMessage("");

            getNFTData(tokenId);
        } catch (e) {
            alert("Error: " + e.message);
        }
    }

    async function resellNFT() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const priceInEther = ethers.utils.parseUnits(resellPrice, 'ether');

            let transaction = await contract.listTokenForSale(data.tokenId, priceInEther);
            await transaction.wait();

            alert('NFT listed for resale successfully!');
            setIsModalOpen(false); // Close the modal
            getNFTData(data.tokenId);
        } catch (e) {
            alert("Error: " + e.message);
        }
    }

    useEffect(() => {
        if (tokenId) {
            getNFTData(tokenId);
        }
    }, [tokenId]);

    useEffect(() => {
        const fetchCurrentAddress = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const addr = await signer.getAddress();
                updateCurrAddress(addr);
            } catch (e) {
                console.error("Error fetching current address:", e);
            }
        };
        fetchCurrentAddress();
    }, []);

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />
            {loading && (
                <div className="fixed inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center">
                    <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-16 h-16 animate-spin"></div>
                    <div className="mt-4 text-white text-lg">Loading...</div>
                </div>
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:space-x-8">
                    {data.image ? (
                        <img src={data.image} alt="NFT" className="w-full md:w-1/2 h-auto rounded-lg shadow-lg" />
                    ) : (
                        !loading && <div>Image not available</div> // Handle case where image might not be available
                    )}
                    <div className="mt-6 md:mt-0 md:w-1/2 text-white">
                        <h1 className="text-2xl font-bold mb-4">{data.name}</h1>
                        <p className="mb-4">{data.description}</p>
                        <div className="mb-4">
                            <strong>Price:</strong> {data.price} ETH
                        </div>
                        <div className="mb-4">
                            <strong>Current Owner:</strong> <span className="text-sm">{data.owner}</span>
                        </div>
                        <div className="mb-4">
                            <strong>Seller:</strong> <span className="text-sm">{data.seller}</span>
                        </div>
                        <div className="mb-4">
                            {currAddress.toLowerCase() === data.owner?.toLowerCase() ? (
                                <div>
                                    <div className="text-emerald-700">You are the owner of this NFT</div>
                                    <button
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Resell this NFT
                                    </button>
                                </div>
                            ) : data.currentlyListed && currAddress.toLowerCase() === data.seller?.toLowerCase() ? (
                                <div>
                                    <div className="text-emerald-700">You are the seller of this NFT</div>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => buyNFT(tokenId)}
                                    >
                                        Buy this NFT
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => buyNFT(tokenId)}
                                >
                                    Buy this NFT
                                </button>
                            )}
                            <div className="text-green text-center mt-3">{message}</div>
                        </div>
                        <div className="flex flex-col space-y-4 mt-4">
                            <Link to={`/certificate/${data.tokenId}`}>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                    View Certificate
                                </button>
                            </Link>
                            <Link to={`/veri`}>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                    Verify Cert
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Resell Confirmation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
                        <h2 className="text-lg font-bold mb-4">Resell NFT</h2>
                        <p className="mb-4">Enter the price at which you want to resell the NFT:</p>
                        <input
                            type="text"
                            value={resellPrice}
                            onChange={(e) => setResellPrice(e.target.value)}
                            className="border rounded p-2 w-full mb-4"
                        />
                        <div className="flex justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={resellNFT}
                            >
                                Confirm Resell
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
