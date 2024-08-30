import axios from 'axios';

// API keys (consider using environment variables for production)
const key = "cb924bc155e5d34fa6ff";
const secret = "4be758cefc7a581fc99da5ae18f6b0b044ca2b3f9198bf0d50158de62d0910bc";

// Upload JSON data to IPFS
export const uploadJSONToIPFS = async (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    try {
        const response = await axios.post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        });
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        };
    } catch (error) {
        console.error("Error uploading JSON to IPFS:", error.response ? error.response.data : error.message);
        return {
            success: false,
            message: error.response ? error.response.data : error.message,
        };
    }
};

// Upload file to IPFS
export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    // Check if file is a base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
        const [header, data] = file.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: mime });

        // Use Blob object for FormData
        file = blob;
    }

    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        });
        console.log("File uploaded:", response.data.IpfsHash);
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        };
    } catch (error) {
        console.error("Error uploading file to IPFS:", error.response ? error.response.data : error.message);
        return {
            success: false,
            message: error.response ? error.response.data : error.message,
        };
    }
};
