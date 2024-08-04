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

    useEffect(() => {
        console.log("Image URL:", data.image);
        console.log("Current Address:", currAddress);
        console.log("Owner Address:", data.owner);
    }, [data, currAddress]);

    return (
        <div style={{ minHeight: "100vh" }}>
            <Navbar />
            {loading && (
                <div className="fixed inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center">
                    <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-16 h-16 animate-spin"></div>
                    <div className="mt-4 text-white text-lg">Loading...</div>
                </div>
            )}
            <div className="flex ml-20 mt-20">
                {data.image ? (
                    <img src={data.image} alt="NFT" className="w-2/5" />
                ) : (
                    !loading && <div>Image not available</div> // Handle case where image might not be available
                )}
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>Name: {data.name}</div>
                    <div>Description: {data.description}</div>
                    <div>Price: <span>{data.price + " ETH"}</span></div>
                    <div>Current Owner: <span className="text-sm">{data.owner}</span></div>
                    <div>Previous Owner: <span className="text-sm">{data.seller}</span></div>
                    <div>
                        {currAddress.toLowerCase() === data.owner?.toLowerCase() ? (
                            <div className="text-emerald-700">You are the owner of this NFT</div>
                        ) : (
                            <button
                                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={() => buyNFT(tokenId)}
                            >
                                Buy this NFT
                            </button>
                        )}
                        <div className="text-green text-center mt-3">{message}</div>
                    </div>
                    <Link to={`/certificate/${data.tokenId}`}>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4">
                            View Certificate
                        </button>
                    </Link>
                    <Link to={`/veri`}>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4">
                            Verify Cert
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
