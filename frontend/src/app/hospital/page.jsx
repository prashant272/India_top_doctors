import React from 'react'
import Footer from '../Components/common/Footer/Footer'
import HospitalDashboard from '../Components/hospital/HospitalDashboard'

export const metadata = {
  title: "Best Hospitals in India | Verified Medical Facilities",
  description: "Explore top-rated and verified hospitals across India. Find medical facilities with the best infrastructure, specialists, and patient care.",
};

const page = () => {
  return (
    <>
      <HospitalDashboard />
      <Footer />
    </>
  )
}

export default page