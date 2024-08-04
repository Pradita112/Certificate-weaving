import axios from 'axios';

const key = "11567ef08fc812acd5c3";
const secret = "a021ed87e9a9d5e2a78b24b1f290f73a0a48aeb99f4d66d036b16f1506821abe";

export const uploadJSONToIPFS = async (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    // making axios POST request to Pinata ⬇️
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};

export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    // Creating FormData directly in the browser
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    // pinataOptions are optional
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

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
            console.log("image uploaded", response.data.IpfsHash);
            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};
