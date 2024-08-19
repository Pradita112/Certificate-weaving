import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Hero = ({ images, texts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className={`relative w-full h-80 overflow-hidden ${isAnimating ? "fade-out" : ""}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
        >
          <img src={image} alt={`Slide ${index}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-black bg-opacity-70 p-6 rounded-lg text-center">
          <p className="text-white text-4xl font-bold gold-text mb-4">{texts[currentIndex]}</p>
          <p className="text-white text-xl font-medium mb-8">Create your own unique NFT today and join the digital art revolution!</p>
          <Link to="/sellnft" className="flex items-center justify-center text-white bg-blue-500 hover:bg-blue-700 font-bold py-3 px-10 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create NFT
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
