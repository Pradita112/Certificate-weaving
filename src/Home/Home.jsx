import Business from "./Components/Business";
import Hero from "./Components/Hero";
import Navbar from "./Components/Navbar";
import styles from "./style";
import businessBackground from "../assets/p1.png";
import Footer from "./Components/Footer";

const App = () => (
  <div className="bg-primary w-full overflow-hidden">
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        <Navbar/>
      </div>
    </div>
    <div className={`bg-primary ${styles.flexStart} `}>
      <div className={`${styles.boxWidth}`}>
        <Hero/>
      </div>
    </div>
    <div className={`bg-white ${styles.paddingX} ${styles.flexCenter}`} style={{backgroundImage: `url(${businessBackground})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className={`${styles.boxWidth}`}>
        <Business/>
      </div>
    </div>
    <div className={`bg-primary ${styles.flexStart} mt-[-50px]`}>
      <div className={`${styles.boxWidth}`}>
        <Footer/>
      </div>
    </div>
  </div>
);

export default App;
