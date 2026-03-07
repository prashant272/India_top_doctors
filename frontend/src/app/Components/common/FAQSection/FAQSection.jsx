'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Can I book an appointment behalf or someone else?',
      answer: 'Yes, you can book an appointment for someone else. Simply provide their details during the booking process, including their name, contact information, and any relevant medical history or concerns.'
    },
    {
      question: 'Do I need a referral to see a Physiotherapist?',
      answer: 'In most cases, you do not need a referral to see a physiotherapist. However, some insurance plans may require one for coverage. We recommend checking with your insurance provider beforehand.'
    },
    {
      question: 'How do I reschedule or cancel my appointment?',
      answer: 'You can easily reschedule or cancel your appointment through our online portal or by contacting our support team at least 24 hours in advance to avoid any cancellation fees.'
    },
    {
      question: 'Do you have venue option for appointments?',
      answer: 'Yes, we offer both in-person appointments at our clinic locations and virtual consultations via video call. You can select your preferred option during the booking process.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI payments, net banking, and digital wallets. Payment can be made at the time of booking or after your consultation.'
    },
    {
      question: 'Will I need a referral to see a Physiotherapist?',
      answer: 'Generally, a referral is not required for physiotherapy sessions. However, if you are using health insurance, please verify with your provider as some plans may require a doctor\'s referral for reimbursement.'
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 text-teal-600 text-9xl font-bold">?</div>
        <div className="absolute bottom-20 right-20 text-orange-600 text-9xl font-bold">?</div>
        <div className="absolute top-1/2 left-1/2 text-teal-600 text-7xl font-bold -translate-x-1/2 -translate-y-1/2">?</div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Ask Questions?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since the when an printer took.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? 'border-teal-400 shadow-xl'
                  : 'border-gray-200 hover:border-teal-200 shadow-md hover:shadow-lg'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300"
              >
                <span className={`text-lg font-semibold transition-colors duration-300 ${
                  openIndex === index ? 'text-teal-700' : 'text-gray-800 group-hover:text-teal-600'
                }`}>
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 rotate-180'
                    : 'bg-gray-100 group-hover:bg-teal-50'
                }`}>
                  <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${
                    openIndex === index ? 'text-white' : 'text-teal-600'
                  }`} />
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-5 pt-0">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
