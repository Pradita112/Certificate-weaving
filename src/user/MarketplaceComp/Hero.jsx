import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link


const Hero = ({ images, texts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // State untuk mengontrol animasi

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Handler untuk mengontrol animasi saat tombol diklik
  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500); // Ubah waktu sesuai durasi animasi CSS
  };

  return (
    <div className={`relative w-full h-80 overflow-hidden ${isAnimating ? "fade-out" : ""}`}> {/* Tambahkan kelas fade-out saat animasi aktif */}
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
       
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"></div>
    </div>
  );
};

export default Hero;
