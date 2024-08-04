import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../backend/utils";

function NFTTile({ data }) {
    const [IPFSUrl, setIPFSUrl] = useState('');

    useEffect(() => {
        const fetchIPFSUrl = async () => {
            if (data.image) {
                const url = GetIpfsUrlFromPinata(data.image);
                setIPFSUrl(url);
            }
        };

        fetchIPFSUrl();
    }, [data.image]);

    // Check if data is not null or undefined
    if (!data) {
        return <div>Data not available</div>; // Or any other appropriate action
    }

    const newTo = {
        pathname: "/nftPage/" + data.tokenId
    };

    return (
        <Link to={newTo}>
            <div className="bg-gray border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
                {IPFSUrl && <img src={IPFSUrl} alt="" className="w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />}
                <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                    <strong className="text-xl">{data.name}</strong>
                    <p className="display-inline">
                        {data.description}
                    </p>
                </div>
            </div>
        </Link>
    );
}

NFTTile.propTypes = {
    data: PropTypes.shape({
        tokenId: PropTypes.number.isRequired,
        image: PropTypes.string,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }),
};

export default NFTTile;
