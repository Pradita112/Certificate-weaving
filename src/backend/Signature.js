// Marketplace.js

import React from 'react';
import Navbar from '../Seller/Navbar';
import styles from "../Home/style";
import Hero from './Hero';
import jp from '../assets/lm.jpg';  // Mengimpor gambar dari aset

const Marketplace = () => {
  return (
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar/>
        </div>
      </div>
      <div 
        className={`${styles.paddingX} ${styles.flexCenter}`}
    
      >
        <div className={`${styles.boxWidth}`}>
          <Hero/>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
