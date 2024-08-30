import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarketplaceJSON from '../backend/UpdateMarket.json';
import { GetIpfsUrlFromPinata } from '../backend/utils';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import styles from '../assets/styles/certificateGenerator.module.css';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';

// Function to extract CID from IPFS URL
function GetCIDFromIPFSURL(ipfsURL) {
    const parts = ipfsURL.split("/");
    const cid = parts[parts.length - 1];
    return cid;
}

// Function to load image
const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load error'));
        img.src = url;
    });
};

export default function Certificate() {
    const [data, setData] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const [currAddress, setCurrAddress] = useState("0x");

    const params = useParams();
    const tokenId = params.tokenId;

    useEffect(() => {
        async function getNFTData(tokenId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let tokenURI = await contract.tokenURI(tokenId);
            const listedToken = await contract.getListedTokenForId(tokenId);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            // Extract data
            const creatorAddress = meta.creatorAddress;
            const name = meta.name;
            const description = meta.description;
            const secondImageCID = GetCIDFromIPFSURL(meta.secondImage);
            const signature = meta.signature;

            let item = {
                price: meta.price ? ethers.utils.parseUnits(meta.price, 'ether') : ethers.constants.Zero,
                tokenId: tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                secondImage: meta.secondImage,
                image: meta.image,
                name: name,
                description: description,
                ipfsURL: tokenURI,
                signature: signature,
                signatureIPFSURL: meta.signatureIPFSURL,
                creatorAddress: creatorAddress,
                secondImageCID: secondImageCID
            };

            setData(item);
            setDataFetched(true);
            setCurrAddress(addr);
        }

        if (!dataFetched) getNFTData(tokenId);
    }, [dataFetched, tokenId]);

    if (typeof data.image === "string") data.image = GetIpfsUrlFromPinata(data.image);

    // Function to handle PDF download
    const handleDownloadPDF = async () => {
        const doc = new jsPDF();

        doc.text("CERTIFICATE TO AUTHENTICITY", 105, 15, { align: "center" });
        doc.text(`FOR THE MAKER OF THIS WORK OF ART: ${data.name}`, 105, 30, { align: "center" });
        doc.text(`FOR HIS WORK THAT IS: ${data.description}`, 105, 45, { align: "center" });
        doc.text(`Creator Address: ${data.creatorAddress}`, 20, 60);
        doc.text(`Signature: ${data.signature}`, 20, 75);
        doc.text(`Date: May 1, 2024`, 20, 90);
        doc.text(`CID: ${data.secondImageCID}`, 20, 105);

        if (data.secondImage) {
            try {
                const img = await loadImage(data.secondImage);
                doc.addImage(img, 'JPEG', 15, 120, 180, 180);
                console.log('Image added to PDF');
            } catch (error) {
                console.error('Error loading image:', error);
            }
        }

        doc.save("certificate.pdf");
    };

    // Create URL for QR code
    const qrCodeUrl = new URL(window.location.origin + "/verify");
    qrCodeUrl.searchParams.set('creatorAddress', data.creatorAddress);
    qrCodeUrl.searchParams.set('name', data.name);
    qrCodeUrl.searchParams.set('description', data.description);
    qrCodeUrl.searchParams.set('secondImageCID', data.secondImageCID);
    qrCodeUrl.searchParams.set('signature', data.signature);

    return (
        <div className={styles.certificateWrapper}>
            <div className={styles.certificateContainer}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={data.image}
                        alt="NFT"
                        className={styles.centeredImage}
                        style={{ width: '200px', height: '300px' }}
                    />
                </div>

                <h1>CERTIFICATE TO AUTHENTICITY</h1>

                <span className={styles.smallText}>FOR THE MAKER OF THIS WORK OF ART</span>

                <p className={styles.primaryItalicText}>{data.name}</p>

                <span className={styles.smallText}>FOR HIS WORK THAT IS</span>

                <h2>{data.description}</h2>

                <div className={`${styles.signatureBlock} ${styles.centerContent}`} style={{ marginTop: '20px' }}>
                    {data.secondImage && (
                        <div className={styles.secondImageContainer}>
                            <img
                                src={data.secondImage}
                                alt="Second Image"
                                className={styles.secondImage}
                            />
                        </div>
                    )}
                    <div className={styles.signatureText}>
                        {data.signature && (
                            <div>
                                <p>Creator Address: {data.creatorAddress}</p>
                                <p>Signature: {data.signature}</p>
                            </div>
                        )}
                    </div>
                    <hr className={styles.shortLine} />
                    <p>CID: {data.secondImageCID}</p>
                </div>

                {/* Generate QR Code */}
                {data.signature && (
                    <div className={styles.qrCode}>
                        <QRCode
                            value={qrCodeUrl.toString()}
                            size={128}
                        />
                        <p>Scan to verify</p>
                    </div>
                )}
            </div>

            <button onClick={handleDownloadPDF} style={{ marginTop: '3rem' }}>Download Certificate PDF</button>
        </div>
    );
}
