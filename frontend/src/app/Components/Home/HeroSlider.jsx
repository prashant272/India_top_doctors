'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, User, Stethoscope, SlidersHorizontal, X, MapPin,
  Shield, TrendingUp, HeartPulse, BadgeCheck, Locate, Map,
  Building2, Hospital as HospitalIcon
} from 'lucide-react'
import { usePatientContext } from '@/app/context/PatientContext'

const STATS = [
  { icon: Shield, label: 'Verified Doctors', value: '500+' },
  { icon: TrendingUp, label: 'Appointments', value: '10K+' },
  { icon: HeartPulse, label: 'Specialties', value: '20+' },
  { icon: BadgeCheck, label: 'Cities Covered', value: '15+' },
]

const SPECIALTIES = ['General Physicians', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Neurologist', 'Pediatrician']
const STATES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune']

const SPECIALTY_ICONS = {
  'General Physicians': '🩺',
  'Cardiologist': '❤️',
  'Orthopedic': '🦴',
  'Dermatologist': '🧴',
  'Neurologist': '🧠',
  'Pediatrician': '👶',
}

const initialSearch = { doctorName: '', specialist: '', state: '', area: '', lat: null, lng: null, locationName: '' }

export default function HeroSlider() {
  const router = useRouter()
  const { doctorList } = usePatientContext()
  const [searchData, setSearchData] = useState(initialSearch)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [localities, setLocalities] = useState([])

  const handleChange = (field) => (e) => setSearchData(prev => ({ ...prev, [field]: e.target.value }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchData.doctorName?.trim()) params.set('doctorName', searchData.doctorName.trim())
    if (searchData.lat) params.set('lat', searchData.lat)
    if (searchData.lng) params.set('lng', searchData.lng)
    if (searchData.locationName) params.set('locationName', searchData.locationName)

    // Maintain state/area for backward compatibility if present
    if (searchData.state) params.set('state', searchData.state)
    if (searchData.area) params.set('area', searchData.area)

    const qs = params.toString()
    router.push(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleSpecialtyClick = (specialty) => {
    router.push(`/patient/doctors?specialist=${encodeURIComponent(specialty)}`)
  }

  // Suggestions logic for Doctor/Clinic/Hospital names
  const suggestions = useMemo(() => {
    if (!searchData.doctorName?.trim() || searchData.doctorName.length < 2) return [];
    const query = searchData.doctorName.toLowerCase();
    const list = Array.isArray(doctorList) ? doctorList : (doctorList?.DoctorList || []);
    const result = [];
    const seen = new Set();

    list.forEach(doc => {
      const docName = (doc.basicInfo?.fullName || doc.name || '');
      if (docName.toLowerCase().includes(query) && !seen.has(`doc:${docName}`)) {
        result.push({ type: 'doctor', label: docName });
        seen.add(`doc:${docName}`);
      }

      (doc.availability || []).forEach(a => {
        if (a.location?.clinicName && a.location.clinicName.toLowerCase().includes(query) && !seen.has(`clinic:${a.location.clinicName}`)) {
          result.push({ type: 'clinic', label: a.location.clinicName });
          seen.add(`clinic:${a.location.clinicName}`);
        }
      });

      (doc.hospitalAffiliations || []).forEach(h => {
        if (h.hospitalName && h.hospitalName.toLowerCase().includes(query) && !seen.has(`hosp:${h.hospitalName}`)) {
          result.push({ type: 'hospital', label: h.hospitalName });
          seen.add(`hosp:${h.hospitalName}`);
        }
      });
    });

    return result.slice(0, 8);
  }, [doctorList, searchData.doctorName]);

  // Google Maps Places Autocomplete Integration
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && searchData.locationName.length > 2) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: searchData.locationName,
        types: ['geocode'],
        componentRestrictions: { country: 'in' }
      }, (predictions) => {
        if (predictions) {
          setLocalities(predictions.map(p => ({
            description: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text
          })));
        }
      });
    } else {
      setLocalities([]);
    }
  }, [searchData.locationName]);

  const handleSelectLocality = (locality) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: locality.placeId }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setSearchData(prev => ({
          ...prev,
          lat: lat(),
          lng: lng(),
          locationName: locality.mainText,
          state: '',
          area: ''
        }));
        setShowLocationDropdown(false);
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const locName = results[0].address_components.find(c => c.types.includes('locality'))?.long_name ||
              results[0].address_components.find(c => c.types.includes('administrative_area_level_2'))?.long_name || "Current Location";
            setSearchData(prev => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              locationName: locName,
              state: '',
              area: ''
            }));
            setShowLocationDropdown(false);
          }
        });
      }, (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your current location. Please search manually.");
      });
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d2d2a 0%, #0f3d38 40%, #0a2e2b 70%, #081f1d 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300e5cc' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 2h4v6h-4zM20 36h4v6h-4zM2 20h6v4H2zM36 20h6v4h-6zM20 18h4v8h-4zM18 20h8v4h-8z'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: '44px 44px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-10">

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400/10 border border-teal-400/25 rounded-full mb-2">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-300 text-xs font-bold tracking-wide">India's Trusted Healthcare Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white leading-tight tracking-tight">
            Find the Right{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400">
              Doctor for You
            </span>
          </h1>
          <p className="text-teal-100/60 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Book with verified specialists instantly. Minimum wait, maximum care.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-5 backdrop-blur-sm hover:bg-white/8 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-400/15 border border-teal-400/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-white font-black text-2xl leading-none">{value}</p>
              <p className="text-teal-100/50 text-xs text-center font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/30 p-2">
          <div className="flex flex-col md:flex-row items-stretch gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Location Search - Left Side */}
            <div className="relative flex-1 group/loc">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/loc:text-teal-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search city or locality..."
                value={searchData.locationName}
                onChange={handleChange('locationName')}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                className="w-full pl-11 pr-12 py-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm font-medium transition-all"
              />
              {searchData.locationName && (
                <button
                  onClick={() => setSearchData(prev => ({ ...prev, locationName: '', lat: null, lng: null }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={handleGetCurrentLocation}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <Locate className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-teal-600">Use my current location</span>
                  </button>

                  {searchData.locationName && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchData(prev => ({ ...prev, lat: null, lng: null }));
                        setShowLocationDropdown(false);
                        handleSearch();
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Search in entire <span className="text-blue-600 capitalize">{searchData.locationName}</span></span>
                    </button>
                  )}

                  {localities.length > 0 && (
                    <div className="px-5 py-2.5 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-y border-slate-50 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Area Predictions
                    </div>
                  )}

                  {localities.length > 0 ? (
                    localities.map((locality, i) => (
                      <button
                        key={i}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectLocality(locality); }}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all shadow-inner">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900">{locality.mainText}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{locality.secondaryText}</p>
                        </div>
                      </button>
                    ))
                  ) : searchData.locationName.length > 2 && (
                    <div className="px-5 py-4 text-xs text-slate-400 italic flex items-center gap-2">
                      <Map className="w-3.5 h-3.5 text-slate-300" /> No matching localities found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Doctor/Clinic Search - Right Side */}
            <div className="relative flex-[1.5] group/search">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-orange-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search doctors, hospitals, clinics, specialists..."
                value={searchData.doctorName}
                onChange={handleChange('doctorName')}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-14 pr-4 py-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm font-medium transition-all"
              />

              {showSuggestions && searchData.doctorName?.trim()?.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                      <button
                        key={i}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchData(prev => ({ ...prev, doctorName: s.label }));
                          setShowSuggestions(false);
                          router.push(`/patient/doctors?doctorName=${encodeURIComponent(s.label)}${searchData.lat ? `&lat=${searchData.lat}&lng=${searchData.lng}&locationName=${encodeURIComponent(searchData.locationName)}` : ''}`);
                        }}
                        className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${s.type === 'doctor' ? 'bg-teal-50 text-teal-600' :
                          s.type === 'hospital' ? 'bg-blue-50 text-blue-600' :
                            'bg-orange-50 text-orange-600'
                          }`}>
                          {s.type === 'doctor' ? <User className="w-5 h-5" /> :
                            s.type === 'hospital' ? <HospitalIcon className="w-5 h-5" /> :
                              <Building2 className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">{s.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.type}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-6 text-center">
                      <p className="text-sm text-slate-400">No suggestions for "{searchData.doctorName}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-1 px-4 flex items-center">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black rounded-2xl transition-all duration-300 text-sm shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/20 p-6">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Browse by Specialty</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyClick(specialty)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/60 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {SPECIALTY_ICONS[specialty]}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{specialty}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}