const styles = {
  boxWidth: "xl:max-w-[1280px] w-full",

  heading2: "font-poppins font-semibold text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] text-white leading-[66.8px] sm:leading-[76.8px] w-full",
  paragraph: "font-poppins font-normal text-dimWhite text-[16px] sm:text-[18px] leading-[24px] sm:leading-[30.8px]",

  flexCenter: "flex justify-center items-center",
  flexStart: "flex justify-start items-start",

  paddingX: "px-6 sm:px-12 md:px-16",
  paddingY: "py-6 sm:py-12 md:py-16",
  padding: "px-6 py-4 sm:px-12 sm:py-8 md:px-16 md:py-12",

  marginX: "mx-6 sm:mx-12 md:mx-16",
  marginY: "my-6 sm:my-12 md:my-16",
};

export const layout = {
  section: `flex flex-col ${styles.paddingY} md:flex-row ${styles.flexStart}`,
  sectionReverse: `flex flex-col-reverse ${styles.paddingY} md:flex-row ${styles.flexStart}`,

  sectionImgReverse: `flex-1 flex ${styles.flexCenter} md:mr-10 mr-0 mt-10 md:mt-0 relative`,
  sectionImg: `flex-1 flex ${styles.flexCenter} md:ml-10 ml-0 mt-10 md:mt-0 relative`,

  sectionInfo: `flex-1 ${styles.flexStart} flex-col`,
};

export default styles;
