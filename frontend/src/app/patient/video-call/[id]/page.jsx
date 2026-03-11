import PatientVideoCall from '@/app/Components/patients/PatientVideoCall/PatientVideoCall'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Video Call...</div>}>
      <PatientVideoCall />
    </Suspense>
  )
}

export default page