import DoctorProfilePage from '@/app/Components/patients/DoctorProfilePage/DoctorProfilePage'
import React from 'react'
import { baseURL } from '@/app/utils/Utils'

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${baseURL}/patient/getdoctors`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const doctor = data.success ? data.data.find(d => d._id === id) : null;

    if (doctor) {
      const name = doctor.basicInfo?.fullName || "Doctor";
      const specialty = doctor.professionalInfo?.specialization || "Specialist";
      const city = doctor.availability?.[0]?.location?.city || "India";

      return {
        title: `Dr. ${name} | ${specialty} in ${city} - India Top Doctors`,
        description: `Book an appointment with Dr. ${name}, a leading ${specialty} at India Top Doctors. Verified reviews, consultation fees, and availability.`,
      };
    }
  } catch (error) {
    console.error("Metadata generation error:", error);
  }
  return {
    title: "Doctor Profile | India Top Doctors",
  };
}

const page = async ({ params }) => {
  const { id } = await params;
  let jsonLd = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8086"}/patient/getdoctors`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const doctor = data.success ? data.data.find(d => d._id === id) : null;

    if (doctor) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": `Dr. ${doctor.basicInfo?.fullName}`,
        "image": doctor.basicInfo?.profileImage,
        "medicalSpecialty": doctor.professionalInfo?.specialization,
        "description": doctor.professionalInfo?.bio || `Best ${doctor.professionalInfo?.specialization} in India`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": doctor.availability?.[0]?.location?.city,
          "addressRegion": doctor.availability?.[0]?.location?.state,
          "addressCountry": "IN"
        },
        "url": `https://www.indiatopdoctors.com/patient/doctors/${id}`
      };
    }
  } catch (e) { }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DoctorProfilePage />
    </>
  )
}

export default page