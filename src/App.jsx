import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home'; // Pastikan path ini sesuai dengan struktur folder Anda
import Marketplace from './Seller/Marketplace';
import ListNFT from "./Seller/ListNFT";
import NFTPage from "./Seller/NFTpage";
import Certificate from './Seller/Certificate';
import Signature from './Verifikasi/Hero';
import MarketplaceUser from "./user/MarketplaceUser"
import Profile from "./Seller/Profile"


function App() {
  return (
    <div className="bg-gray container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/sellnft" element={<ListNFT/>}/> 
        <Route path="/nftPage/:tokenId" element={<NFTPage />} />
        <Route path="/certificate/:tokenId" element={<Certificate />} />
        <Route path="/veri" element={<Signature />} />
        <Route path="/marketuser" element={<MarketplaceUser/>}/> 
        <Route path="/profile" element={<Profile/>}/> 
      </Routes>
    </div>
  );
}

export default App;
