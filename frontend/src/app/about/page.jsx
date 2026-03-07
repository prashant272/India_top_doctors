import HowItWorksSection from '@/app/Components/Home/HowItWorksSection'
import BuildingSection from '@/app/Components/patients/About/BuildingSection'
import React from 'react'
import Navbar from '../Components/common/Navbar/Navbar'
import Footer from '../Components/common/Footer/Footer'
import AppointmentCTASection from '../Components/Home/AppointmentCTASection'

export const metadata = {
  title: "About India Top Doctors | Our Mission & Vision",
  description: "Learn more about India Top Doctors, our mission to provide quality healthcare, and how we connect patients with the best medical professionals in India.",
};

const page = () => {
  return (
    <>
      <Navbar />
      <BuildingSection />
      <HowItWorksSection />
      <AppointmentCTASection />
      <Footer />
    </>
  )
}

export default page