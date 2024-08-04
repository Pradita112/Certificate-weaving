import React, { useState } from "react";
import styles from "../style";
import GetStarted from "./GetStarted";
import test from "../../assets/test.png";
import SignIn from "./SignInModal";

const Hero = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const handleGetStartedClick = () => {
    setIsSignInOpen(true);
  };

  const handleCloseSignIn = () => {
    setIsSignInOpen(false);
  };

  return (
    <section id="home" className={`flex md:flex-row flex-col ${styles.paddingY}`}>
      <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
        <div className="flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-4">
          <p className={`${styles.paragraph} ml-2`}>
            <span className="text-white"></span> Welcome To Future{" "}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center w-full mb-8">
          <h1 className="flex-1 font-poppins font-bold ss:text-[75px] text-[40px] sm:text-[60px] md:text-[70px] gold-text ss:leading-[100.8px] leading-[50px] sm:leading-[70px] md:leading-[70px]">
            Tersedia untuk <br className="sm:block hidden" />{" "}
            <span className="gold-text">Melindungi</span>{" "}
          </h1>
        </div>
        <p className={`${styles.paragraph} max-w-[450px] mt-1`}>
            Mari membuat sertifikat mandiri untuk ke langsungan tenun LOMBOK!!
        </p>
        <div>
          <button 
            type="button" 
            className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary rounded-[10px] outline-none mt-5 button`} 
            onClick={handleGetStartedClick}
          >
            Get Started
          </button>
        </div>
      </div>

      <div className={`flex-1 flex ${styles.flexCenter} md:my-0 my-10 relative`}>
        <img src={test} alt="billing" className="w-[88%] h-auto md:h-[75%] relative z-[5]" />

        {/* gradient start */}
        <div className="absolute z-[0] w-[40%] h-[10%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[40%] h-[35%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        {/* gradient end */}
      </div>

      <div className={`ss:hidden ${styles.flexCenter} mt-10`}>
        <GetStarted />
      </div>

      {/* SignIn Modal */}
      <SignIn isOpen={isSignInOpen} onClose={handleCloseSignIn} />
    </section>
  );
};

export default Hero;
