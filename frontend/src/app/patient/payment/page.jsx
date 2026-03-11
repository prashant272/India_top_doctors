import PaymentPage from '@/app/Components/patients/Paymentpage/Paymentpage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <PaymentPage />
    </Suspense>
  )
}

export default page