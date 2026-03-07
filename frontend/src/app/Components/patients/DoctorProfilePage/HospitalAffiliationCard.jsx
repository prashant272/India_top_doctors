'use client'

import { Building2, BadgeCheck, MapPin, Clock, Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function HospitalCard({ a, type }) {
  const h = a.hospital || {}
  const isCurrent = type === 'current'

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${isCurrent ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' : 'border-slate-100 bg-slate-50'}`}>
      <div className="flex items-start gap-4 p-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${isCurrent ? 'bg-white border-emerald-100 shadow-sm' : 'bg-white border-slate-100'}`}>
          {h.logo?.url
            ? <img src={h.logo.url} alt={h.name} className={`w-full h-full object-cover rounded-xl ${!isCurrent ? 'opacity-60' : ''}`} />
            : <Building2 className={`w-5 h-5 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={`text-sm font-black truncate ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                  {h.name || a.hospitalName}
                </p>
                {h.isVerified && (
                  <BadgeCheck className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-teal-500' : 'text-slate-400'}`} />
                )}
              </div>

              {(h.address?.city || h.address?.state) && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[h.address.city, h.address.state].filter(Boolean).join(', ')}
                </p>
              )}

              <p className={`text-[11px] flex items-center gap-1 mt-1 font-semibold ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isCurrent
                  ? <><Calendar className="w-3 h-3" /> Since {formatDate(a.joinedAt)}</>
                  : <><Clock className="w-3 h-3" /> {formatDate(a.joinedAt)} – {a.leftAt ? formatDate(a.leftAt) : 'Present'}</>
                }
              </p>
            </div>

            <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border ${isCurrent ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              {isCurrent ? 'Current' : 'Former'}
            </span>
          </div>

          {h.website && (
            <a
              href={h.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isCurrent
                  ? 'text-teal-700 bg-white border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600'
                  : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-700'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              Visit Hospital
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HospitalAffiliationCard({ doctor }) {
  const [showAllPast, setShowAllPast] = useState(false)

  const affiliations = doctor.hospitalAffiliations || []
  const current = affiliations.filter(a => a.isCurrent)
  const past    = affiliations.filter(a => !a.isCurrent)
  const visiblePast = showAllPast ? past : past.slice(0, 2)

  if (!affiliations.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hospital Affiliations</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {current.length} current · {past.length} past
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {affiliations.length} Total
        </span>
      </div>

      <div className="p-5 space-y-5">
        {current.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Currently Working At
            </p>
            <div className="space-y-2">
              {current.map((a, i) => <HospitalCard key={i} a={a} type="current" />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="space-y-2.5">
            {current.length > 0 && <div className="border-t border-slate-100" />}
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
              Previously Worked At
            </p>
            <div className="space-y-2">
              {visiblePast.map((a, i) => <HospitalCard key={i} a={a} type="past" />)}
            </div>

            {past.length > 2 && (
              <button
                onClick={() => setShowAllPast(p => !p)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black text-slate-500 uppercase tracking-wider hover:text-slate-800 hover:bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all duration-200"
              >
                {showAllPast
                  ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> +{past.length - 2} More</>
                }
              </button>
            )}
          </div>
        )}

        {affiliations.length === 0 && (
          <div className="text-center py-6">
            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No affiliations listed</p>
          </div>
        )}
      </div>
    </div>
  )
}
