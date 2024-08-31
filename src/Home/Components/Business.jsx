import { features } from "../constants";
import styles, { layout } from "../style";
import Button from "./Butto"; // Pastikan nama import sesuai dengan file yang ada

const FeatureCard = ({ icon, title, content, index }) => (
  <div className={`flex flex-row p-6 rounded-[20px] ${index !== features.length - 1 ? "mb-6" : "mb-0"} feature-card`}>
    <div className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}>
      <img src={icon} alt={title} className="w-[50%] h-[50%] object-contain" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h4 className="font-poppins font-semibold text-white text-[18px] leading-[23.4px] mb-1">
        {title}
      </h4>
      <p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px]">
        {content}
      </p>
    </div>
  </div>
);

const Business = () => (
  <section id="features" className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={`${styles.heading2} sm:text-[32px] text-[24px]`}>
        Fokus pada bisnis Anda, <br className="sm:block hidden" /> kami tangani
        sertifikat dan NFT Anda.
      </h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Dalam era digital saat ini, NFT dan sertifikat berbasis blockchain dapat meningkatkan kredibilitas dan nilai karya Anda. Dengan memanfaatkan teknologi ini, Anda dapat memastikan keaslian dan kepemilikan karya Anda dengan lebih mudah.
      </p>
      <button
        type="button"
        className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-blue-600 hover:bg-blue-700 rounded-[10px] outline-none mt-5`}
      >
        Mulai Sekarang
      </button>
    </div>

    <div className={`${layout.sectionImg} flex flex-col`}>
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} index={index} />
      ))}
    </div>
  </section>
);

export default Business;
