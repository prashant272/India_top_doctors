'use client'

import { GraduationCap, Award, Briefcase, CheckCircle } from 'lucide-react'

export default function ExperienceTab({ doctor }) {
  const pi = doctor.professionalInfo || {}

  const qualification = pi.qualification  || ''
  const licenseNo     = pi.licenseNumber  || ''

  const education = qualification
    ? [{ degree: qualification, institution: 'Registered Medical Practitioner', year: '' }]
    : []

  return (
    <>
      {/* Education */}
      {education.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-teal-600" />
            </div>
            Education & Qualifications
          </h3>
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-slate-500 text-sm">{edu.institution}</p>
                  {edu.year && <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* License */}
      {licenseNo && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-teal-600" />
            </div>
            License
          </h3>
          <div className="flex items-center gap-3 text-slate-700 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm">
              License No: <span className="font-bold text-slate-900">{licenseNo}</span>
            </span>
          </div>
        </div>
      )}

      {/* Memberships */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          Professional Memberships
        </h3>
        <div className="space-y-2.5">
          {['Indian Medical Association', 'Medical Council of India'].map((m, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
