import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import newMarketplace from '../../backend/UpdateMarket.json';

const RoleSelectionModal = ({ isOpen, onClose, onRoleSelect }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const contractAddress = newMarketplace.address;
    const contractABI = newMarketplace.abi;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!window.ethereum) {
                alert('Please install MetaMask!');
                return;
            }

            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI, signer);

                const userAddress = await signer.getAddress();
                const role = await contract.getUserRole(userAddress);

                // Check if role is a BigNumber and convert if necessary
                const roleValue = ethers.BigNumber.isBigNumber(role) ? role.toNumber() : role;

                setUserRole(roleValue);
                setLoading(false);

                if (roleValue === 1) {
                    window.location.href = '/marketuser';
                } else if (roleValue === 2) {
                    window.location.href = '/market';
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                alert('Failed to fetch user role. Please try again.');
                setLoading(false); // Ensure loading is turned off even on error
            }
        };

        if (isOpen) {
            fetchUserRole();
        }
    }, [isOpen, contractAddress, contractABI]);

    const handleRoleSelect = async (role) => {
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const roleValue = role === 'Buyer' ? 1 : 2;  // Assume 1 for Buyer and 2 for Seller
            const tx = await contract.setUserRole(roleValue);
            await tx.wait();

            onRoleSelect(role);

            // Redirect based on the selected role
            if (role === 'Buyer') {
                window.location.href = '/user';
            } else if (role === 'Seller') {
                window.location.href = '/market';
            }
        } catch (error) {
            console.error('Error setting user role:', error);
            alert('Failed to set user role. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            {loading ? (
                <div className="flex flex-col justify-center items-center bg-primary p-8 rounded-lg">
                    <div className="border-8 border-t-8 border-primary border-t-secondary rounded-full w-16 h-16 animate-spin"></div>
                    <div className="mt-4 text-white text-lg">Loading...</div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Select Your Role</h2>
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => handleRoleSelect('Buyer')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Buyer
                        </button>
                        <button
                            onClick={() => handleRoleSelect('Seller')}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Seller
                        </button>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelectionModal;
