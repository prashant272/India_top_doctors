import React from 'react'
import ContactPage from '../Components/patients/Contact/Contact'
import Navbar from '../Components/common/Navbar/Navbar'
import Footer from '../Components/common/Footer/Footer'

export const metadata = {
  title: "Contact Us | India Top Doctors Support",
  description: "Have questions? Get in touch with India Top Doctors. Our support team is here to help you with appointments, account issues, and medical queries.",
};

const page = () => {
  return (
    <>
      <Navbar />
      <ContactPage />
      <Footer />
    </>
  )
}

export default page