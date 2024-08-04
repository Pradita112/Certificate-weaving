import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import MarketplaceJSON from "../backend/NewMarketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";
import { ethers } from "ethers";
import styles from "../Home/style"; // Assuming you have a style file

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");

  const params = useParams();
  const tokenId = params.tokenId;

  useEffect(() => {
    if (!dataFetched) {
      getNFTData(tokenId);
    }
  }, [dataFetched, tokenId]);

  async function getNFTData(tokenId) {
    let sumPrice = 0;
    // Get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    // Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );

    // Get NFTs owned by the user
    let transaction = await contract.getMyNFTs();

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        if (i.seller.toLowerCase() === addr.toLowerCase()) {
          sumPrice += Number(price);
          return item;
        }
      })
    );

    // Filter out undefined values (NFTs not owned by the user)
    const filteredItems = items.filter((item) => item !== undefined);

    updateData(filteredItems);
    updateFetched(true);
    updateAddress(addr);
    updateTotalPrice(sumPrice.toPrecision(3));
  }

  return (
    <div className="bg-primary w-full overflow-hidden min-h-screen text-white">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth} py-10`}>
          <div className="text-center py-10">
            <h2 className="font-bold text-2xl mb-4 gold-text">Wallet Address</h2>
            <p className="text-xl">{address}</p>
          </div>
          <div className="flex justify-center mt-10 space-x-20">
            <div className="text-center">
              <h2 className="font-bold text-2xl gold-text">No. of NFTs</h2>
              <p className="text-xl">{data.length}</p>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-2xl gold-text">Total Value</h2>
              <p className="text-xl">{totalPrice} ETH</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <h2 className="font-bold text-2xl mb-4 gold-text">Your NFTs</h2>
            <div className="flex flex-wrap justify-center">
              {data.length > 0 ? (
                data.map((value, index) => (
                  <NFTTile data={value} key={index} />
                ))
              ) : (
                <p className="text-xl mt-10">
                  Oops, No NFT data to display (Are you logged in?)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
