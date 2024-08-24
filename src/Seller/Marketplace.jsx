import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import styles from "../Home/style";
import Item from './MarketplaceComp/Item';
import Hero from './MarketplaceComp/Hero';
import { providers, Contract, utils } from "ethers";
import MarketplaceJSON from "../backend/UpdateMarket.json";
import { GetIpfsUrlFromPinata } from "../backend/utils";

const Marketplace = () => {
  const [nfts, setNFTs] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([
    "Check out today's hot NFT!",
    "Discover unique digital assets!",
    "Own a piece of digital art!",
    "Explore the NFT marketplace!",
    "Find your next digital collectible!"
  ]);
  const [loading, setLoading] = useState(true); // Add loading state

  // Function to fetch metadata with retries
  const fetchMetadata = async (url, retries = 3) => {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data; // Return only the data part of response
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying fetch for ${url}, attempts left: ${retries}`);
        return fetchMetadata(url, retries - 1);
      }
      throw new Error(`Failed to fetch metadata from ${url}`);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        let provider;
        if (window.ethereum == null) {
          console.log("MetaMask not installed; using read-only defaults");
          provider = providers.getDefaultProvider();
        } else {
          provider = new providers.Web3Provider(window.ethereum);
        }

        const signer = provider.getSigner();
        const contract = new Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const transaction = await contract.getAllNFTs();

        console.log("Fetched NFTs:", transaction); // Debugging

        const items = await Promise.all(transaction.map(async i => {
          let tokenURI = await contract.tokenURI(i.tokenId);
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          const meta = await fetchMetadata(tokenURI);
          const price = utils.formatUnits(i.price.toString(), 'ether');
          return {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
        }));

        console.log("NFT Items:", items); // Debugging

        setNFTs(items);
        setImages(items.map(item => item.image)); // Extracting images for slideshow
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Hide loading screen when done
      }
    }

    if (!dataFetched) {
      fetchData();
    }
  }, [dataFetched]);

  return (
    <div className="bg-primary w-full overflow-hidden">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen bg-primary">
          <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-16 h-16 animate-spin"></div>
          <div className="mt-4 text-white text-lg">Loading...</div>
        </div>
      ) : (
        <div>
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <Navbar />
              <Hero images={images} texts={texts} /> {/* Add Hero component here */}
            </div>
          </div>
          <div className={`bg-primary ${styles.flexStart} mt-[-50px]`}>
            <div className={`${styles.boxWidth}`}>
              <section className={`flex flex-col ${styles.paddingY}`}>
                <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
                  <div className="flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-4">
                    <p className={`${styles.paragraph} ml-2`}>
                      <span className="text-white"></span> Your Shopping Cart
                    </p>
                  </div>

                  <div className="flex flex-row justify-between items-center w-full mb-8">
                    <h1 className="flex-1 font-poppins font-bold ss:text-[48px] text-[40px] text-white ss:leading-[76.8px] leading-[66.8px]">
                      Items in your <span className="gold-text">Cart</span>
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {nfts.length > 0 ? (
                      nfts.map(item => (
                        <Item key={item.tokenId} item={item} />
                      ))
                    ) : (
                      <p className="text-white">No items available.</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
