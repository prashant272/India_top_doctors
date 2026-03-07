import Image from "next/image";
import Navbar from "./Components/common/Navbar/Navbar";
import HeroSlider from "./Components/Home/HeroSlider";
import TopSpecialtiesSection from "./Components/Home/TopSpecialtiesSection";
import HowItWorksSection from "./Components/Home/HowItWorksSection";
import AppointmentCTASection from "./Components/Home/AppointmentCTASection";
import FindDoctorSection from "./Components/Home/FindDoctorSection";
import FAQSection from "./Components/common/FAQSection/FAQSection";
import DoctorRegistrationSection from "./Components/Home/DoctorRegistrationSection";
import BlogSection from "./Components/common/BlogSection/BlogSection";
import Footer from "./Components/common/Footer/Footer";
import TopRatedDoctors from "./Components/Home/TopRatedDoctors";
import PlatformReviewsSection from "./Components/Home/PlatformReviewsSection";
import FeaturedDoctors from "./Components/Home/featuredDoctors";
import TopHospitalsSection from "./Components/Home/TopHospitalsSection";

export default function Home() {
  return (
     <>
     <Navbar/>
     <HeroSlider/>
     <FeaturedDoctors/>
     <TopRatedDoctors/>
     <TopSpecialtiesSection/>
     <TopHospitalsSection/>
     <HowItWorksSection/>
     <AppointmentCTASection/>
     <FindDoctorSection/>
     <FAQSection/>
     <DoctorRegistrationSection/>
     <PlatformReviewsSection/>
     <BlogSection/>
     <Footer/>
     </>
  );
}
