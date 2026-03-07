'use client'

import { usePathname } from 'next/navigation'
import Footer from "../Components/common/Footer/Footer"
import Navbar from "../Components/common/Navbar/Navbar"

export default function UserLayout({ children }) {
  const pathname = usePathname()
  const hideShell = pathname?.includes('/video-call')

  return (
    <>
      {!hideShell && <Navbar />}
      {children}
      {!hideShell && <Footer />}
    </>
  )
}
