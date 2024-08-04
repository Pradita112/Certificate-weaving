import React from 'react'
import styles from "../Home/style";
import SellNft from './ListNFTComp/SellNft';
import Navbar from './Navbar';

const ListNFT = () => {
  return (
    <div className=" w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar/>
        </div>
      </div>
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <SellNft/>
        </div>
      </div>
    </div>
  )
}

export default ListNFT
