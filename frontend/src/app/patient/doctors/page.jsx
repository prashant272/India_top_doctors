import DoctorSearchSection from '@/app/Components/patients/DoctorSearchSection/DoctorSearchSection'
import React, { Suspense } from 'react'

export const metadata = {
  title: "Search Best Doctors in India | Online Appointment Booking",
  description: "Search for verified doctors across India by specialty, location, or name. Book appointments online and get quality healthcare services.",
};


const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <DoctorSearchSection />
    </Suspense>
  )
}

export default page