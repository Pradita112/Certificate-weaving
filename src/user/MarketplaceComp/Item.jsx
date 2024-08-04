import React from 'react';
import { Link } from 'react-router-dom';

// Example exchange rate for ETH to IDR, in real application this should be dynamically fetched from an API
const ETH_TO_IDR = 40000000; // 1 ETH = 40,000,000 IDR

const Item = ({ item }) => {
  // Convert item price from ETH to IDR
  const priceInIDR = (item.price * ETH_TO_IDR).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  return (
    <div className="flex-shrink-0 w-77 p-4 m-2 bg-white rounded-lg shadow-md">
      <Link to={`/nftPage/${item.tokenId}`}>
        <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-extrabold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <p className="text-sm font-semibold text-green-500">Price: {priceInIDR}</p>
      </div>
    </div>
  );
};

export default Item;
