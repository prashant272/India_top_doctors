'use client'

import { Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Instagram, Send } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks1 = [
    { name: 'About', href: '/about' },
    { name: 'Doctor', href: '/patient/doctor' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
     { name: 'Testimonial', href: '/testimonial' },
  ]

  // const quickLinks2 = [
  //   { name: 'Testimonial', href: '/testimonial' },
  //   { name: 'Privacy Policy', href: '/privacy-policy' },
  //   { name: 'Terms And Condition', href: '/terms-conditions' },
  //   { name: 'Cancellation Policy', href: '/cancellation-policy' },
  //   { name: 'Refund Policy', href: '/refund-policy' }
  // ]

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter', color: 'hover:bg-blue-400' },
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' }
  ]

  return (
    <footer className="bg-gradient-to-br from-teal-50 via-blue-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
                About
                <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              </h4>
              <p className="text-gray-600 leading-relaxed mb-6">
                The printing and typesetting industry Ipsum has been the industry's thanks to your passion, hard work creativity
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              </h4>
              <ul className="space-y-3">
                {quickLinks1.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-teal-600 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              </h4>
              <ul className="space-y-3">
                {quickLinks2.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-teal-600 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
                Community
                <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              </h4>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>India</span>
                  </div>
                </li>
                <li>
                  <a
                    href="tel:+919319931904"
                    className="flex items-start gap-3 text-gray-600 hover:text-teal-600 transition-colors duration-300"
                  >
                    <Phone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>(+91) 9319-9319-04</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:indiatopdoctor@gmail.com"
                    className="flex items-start gap-3 text-gray-600 hover:text-teal-600 transition-colors duration-300 break-all"
                  >
                    <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>indiatopdoctor@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 text-center md:text-left">
                Copyright {currentYear} | India Top Doctor. All Rights Reserved
              </p>
              <div className="flex gap-4 text-sm">
                <Link href="/privacy-policy" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">|</span>
                <Link href="/terms-conditions" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
