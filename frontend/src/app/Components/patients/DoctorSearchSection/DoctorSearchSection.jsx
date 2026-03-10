'use client'

import { useMemo, useContext, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, User, Clock, CheckCircle,
  Calendar, Video, ChevronDown, ChevronUp, Stethoscope,
  GraduationCap, BadgeCheck, Wifi, SlidersHorizontal, X,
  MapPin, Zap, Map, Locate, Building2, Hospital as HospitalIcon,
} from 'lucide-react'
import { AuthContext } from '@/app/context/AuthContext'
import { usePatientContext } from '@/app/context/PatientContext'
import { useDoctors } from '@/app/hooks/useDoctors'
import useAppointment from '@/app/hooks/useAppointment'

const initialSearchData = { doctorName: '', specialist: '', state: '', area: '', lat: null, lng: null, locationName: '' }
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SPECIALTIES = ['General Physicians', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Neurologist', 'Pediatrician']
const STATES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune']
const SPECIALTY_CARDS = [
  { label: 'General Physicians', emoji: '🩺' },
  { label: 'Cardiologist', emoji: '❤️' },
  { label: 'Orthopedic', emoji: '🦴' },
  { label: 'Dermatologist', emoji: '🧴' },
  { label: 'Neurologist', emoji: '🧠' },
  { label: 'Pediatrician', emoji: '👶' },
]

function normalizeSpecialist(raw) {
  if (!raw?.trim()) return ''
  const lower = raw.trim().toLowerCase()
  return SPECIALTIES.find(s => s.toLowerCase() === lower)
    || SPECIALTIES.find(s => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()))
    || raw.trim()
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${ampm}`
}

function DoctorAvatar({ src, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClasses = size === 'lg' ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-lg'
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'Dr'
  const colors = ['from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600']
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  if (src && !imgError) {
    return <img src={src} alt={name || 'Doctor'} className={`${sizeClasses} rounded-2xl object-cover`} onError={() => setImgError(true)} />
  }
  return (
    <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white`}>
      {initials}
    </div>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-teal-900 transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

function AvailabilityBlock({ availability }) {
  const [expanded, setExpanded] = useState(false)
  if (!Array.isArray(availability) || availability.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>Availability not listed</span>
      </div>
    )
  }
  const primary = availability[0]
  const hasMore = availability.length > 1
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 cursor-pointer" onClick={() => hasMore && setExpanded(p => !p)}>
        <Clock className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">{formatTime(primary.startTime)} – {formatTime(primary.endTime)}</p>
            {hasMore && (
              <button className="text-teal-500 shrink-0">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Array.isArray(primary.workingDays) && primary.workingDays.map(day => (
              <span key={day} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-md font-semibold">
                {typeof day === 'number' ? DAYS_SHORT[day] : day.slice(0, 3)}
              </span>
            ))}
          </div>
          {primary.location?.address && (
            <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{primary.location.address}
            </p>
          )}
        </div>
      </div>
      {expanded && availability.slice(1).map((slot, i) => (
        <div key={i} className="flex items-start gap-2 pl-5 border-l-2 border-teal-100 ml-1.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(slot.workingDays) && slot.workingDays.map(day => (
                <span key={day} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded-md font-semibold">
                  {typeof day === 'number' ? DAYS_SHORT[day] : day.slice(0, 3)}
                </span>
              ))}
            </div>
            {slot.location?.address && (
              <p className="text-[10px] text-slate-400 mt-1 truncate">📍 {slot.location.address}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DoctorSearchSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { UserAuthData } = useContext(AuthContext)
  const { doctorList, loading } = usePatientContext()
  const { fetchDoctors } = useDoctors()
  const { createAppointment } = useAppointment()

  const rawAddress = UserAuthData?.roleData?.address || ''
  const userCity = rawAddress.split(',')[0].trim().toLowerCase()

  const [searchData, setSearchData] = useState(initialSearchData)
  const [appliedFilters, setAppliedFilters] = useState(initialSearchData)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [localities, setLocalities] = useState([])

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

  useEffect(() => {
    const doctorName = searchParams.get('doctorName') || ''
    const raw = searchParams.get('specialist') || ''
    const specialist = normalizeSpecialist(raw)
    const state = searchParams.get('state') || ''
    const area = searchParams.get('area') || ''
    const lat = searchParams.get('lat') || null
    const lng = searchParams.get('lng') || null
    const locationName = searchParams.get('locationName') || ''
    const hasAny = doctorName || specialist || state || area || lat || lng
    if (!hasAny) return
    const preset = { doctorName, specialist, state, area, lat, lng, locationName }
    setSearchData(preset)
    setAppliedFilters(preset)
  }, [searchParams])

  // Google Maps Places Autocomplete Integration for Localities
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
        const newLat = lat();
        const newLng = lng();
        setSearchData(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          locationName: locality.mainText,
          state: '',
          area: ''
        }));
        setAppliedFilters(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          locationName: locality.mainText,
          state: '',
          area: ''
        }));
        setShowLocationDropdown(false);
        // Force URL update for locality selection
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', newLat);
        params.set('lng', newLng);
        params.set('locationName', locality.mainText);
        params.delete('state');
        params.delete('area');
        router.replace(`/patient/doctors?${params.toString()}`);
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const newLat = latitude;
        const newLng = longitude;
        const newLocName = 'Current Location';

        const updated = {
          ...searchData,
          lat: newLat,
          lng: newLng,
          locationName: newLocName,
          state: '',
          area: ''
        };
        setSearchData(updated);
        setAppliedFilters(updated);
        setShowLocationDropdown(false);

        // Force URL update
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', newLat);
        params.set('lng', newLng);
        params.set('locationName', newLocName);
        params.delete('state');
        params.delete('area');
        router.replace(`/patient/doctors?${params.toString()}`);
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  };

  const handleChange = (field) => (e) => setSearchData(prev => ({ ...prev, [field]: e.target.value }))
  const handleApplyFilters = () => {
    setAppliedFilters(searchData)
    const params = new URLSearchParams(searchParams.toString())
    if (searchData.doctorName) params.set('doctorName', searchData.doctorName)
    else params.delete('doctorName')

    if (searchData.specialist) params.set('specialist', searchData.specialist)
    else params.delete('specialist')

    if (searchData.state) params.set('state', searchData.state)
    else params.delete('state')

    if (searchData.area) params.set('area', searchData.area)
    else params.delete('area')

    if (searchData.lat) params.set('lat', searchData.lat)
    else params.delete('lat')

    if (searchData.lng) params.set('lng', searchData.lng)
    else params.delete('lng')

    if (searchData.locationName) params.set('locationName', searchData.locationName)
    else params.delete('locationName')

    const qs = params.toString()
    router.replace(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleClearAll = () => {
    setSearchData(initialSearchData)
    setAppliedFilters(initialSearchData)
    router.replace('/patient/doctors')
  }

  const handleRemoveFilter = (field) => {
    const updated = { ...searchData, [field]: '', ...(field === 'lat' || field === 'lng' ? { lat: null, lng: null, locationName: '' } : {}) }
    setSearchData(updated)
    setAppliedFilters(updated)
    const params = new URLSearchParams(searchParams.toString())
    params.delete(field)
    if (field === 'lat' || field === 'lng') {
      params.delete('lat')
      params.delete('lng')
      params.delete('locationName')
    }
    const qs = params.toString()
    router.replace(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleSpecialtyCardClick = (label) => {
    const next = appliedFilters.specialist === label ? '' : label
    const updated = { ...searchData, specialist: next }
    setSearchData(updated)
    setAppliedFilters(updated)
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set('specialist', next)
    else params.delete('specialist')
    const qs = params.toString()
    router.replace(`/patient/doctors${qs ? `?${qs}` : ''}`)
  }

  const handleBookAppointment = (doctorId, mode = null) => {
    if (!UserAuthData?.token) { router.push('/auth'); return }
    const path = `/patient/${doctorId}`
    const query = new URLSearchParams()
    if (mode) query.set('mode', mode)
    const qs = query.toString()
    router.push(qs ? `${path}?${qs}` : path)
  }

  const handleViewProfile = (doctorId) => router.push(`/patient/doctors/${doctorId}`)

  const filteredDoctors = useMemo(() => {
    let list = []
    if (Array.isArray(doctorList)) list = doctorList
    else if (doctorList?.DoctorList) list = doctorList.DoctorList
    else if (Array.isArray(doctorList?.data)) list = doctorList.data

    const { doctorName, specialist, state, area, lat, lng } = appliedFilters
    const hasActive = (doctorName?.trim() || '') || (specialist?.trim() || '') || (state?.trim() || '') || (area?.trim() || '') || (lat && lng)

    let filtered = hasActive
      ? list.filter(doctor => {
        const nameMatchString = [
          doctor.basicInfo?.fullName,
          doctor.name,
          ...(doctor.availability || []).map(a => a.location?.clinicName),
          ...(doctor.hospitalAffiliations || []).map(h => h.hospitalName)
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesName = doctorName ? nameMatchString.includes(doctorName.toLowerCase()) : true
        const docSpec = (doctor.professionalInfo?.specialization || doctor.specialty || '').toLowerCase().trim()
        const filterSpec = specialist.toLowerCase().trim()
        const matchesSpecialist = specialist ? docSpec === filterSpec || docSpec.includes(filterSpec) || filterSpec.includes(docSpec) : true
        const matchesState = state ? (doctor.basicInfo?.state || doctor.state || '').toLowerCase() === state.toLowerCase() : true
        const matchesArea = area ? (doctor.basicInfo?.area || doctor.area || '').toLowerCase().includes(area.toLowerCase()) : true
        return matchesName && matchesSpecialist && matchesState && matchesArea
      })
      : list

    // Haversine Distance Calculation for sorting by proximity
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    if (lat && lng) {
      const withDistance = filtered.map(doctor => {
        let minDistance = Infinity;
        (doctor.availability || []).forEach(avail => {
          if (avail.location?.coordinates?.coordinates) {
            const [docLng, docLat] = avail.location.coordinates.coordinates;
            const dist = getDistance(lat, lng, docLat, docLng);
            if (dist < minDistance) minDistance = dist;
          }
        });
        return { ...doctor, distance: minDistance };
      });

      const NEARBY_THRESHOLD = 25; // km
      const closeMatches = withDistance.filter(d => d.distance <= NEARBY_THRESHOLD);

      if (closeMatches.length > 0) {
        filtered = closeMatches.sort((a, b) => a.distance - b.distance);
      } else {
        // No one within 25km? Show nearest matching doctors as recommendations
        const nearestMatching = withDistance.filter(d => d.distance !== Infinity)
          .sort((a, b) => a.distance - b.distance)
          .map(d => ({ ...d, isNearbyRecommendation: true }));

        if (nearestMatching.length > 0) {
          filtered = nearestMatching.slice(0, 5);
        } else if (list.length > 0) {
          // If no matching doctors at ALL, show ANY nearest doctors
          filtered = list.map(doctor => {
            let minDistance = Infinity;
            (doctor.availability || []).forEach(avail => {
              if (avail.location?.coordinates?.coordinates) {
                const [docLng, docLat] = avail.location.coordinates.coordinates;
                const dist = getDistance(lat, lng, docLat, docLng);
                if (dist < minDistance) minDistance = dist;
              }
            });
            return { ...doctor, distance: minDistance, isNearbyRecommendation: true };
          }).filter(d => d.distance !== Infinity)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
        }
      }
    } else if (userCity) {
      filtered = [...filtered].sort((a, b) => {
        const aCity = [a.basicInfo?.location, a.basicInfo?.area, a.basicInfo?.state, a.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
        const bCity = [b.basicInfo?.location, b.basicInfo?.area, b.basicInfo?.state, b.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
        return (aCity.includes(userCity) ? 0 : 1) - (bCity.includes(userCity) ? 0 : 1)
      })
    }

    return filtered
  }, [doctorList, appliedFilters, userCity])

  const activeFilterCount = Object.values(appliedFilters).filter(v => v && typeof v === 'string' ? v.trim() : v).length
  const hasActiveFilters = activeFilterCount > 0

  return (
    <section className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xl shadow-slate-200/50">
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
                        setSearchData(prev => ({ ...prev, lat: null, lng: null })); // Use string matching for city
                        setAppliedFilters(prev => ({ ...prev, locationName: searchData.locationName, lat: null, lng: null }));
                        setShowLocationDropdown(false);
                        handleApplyFilters();
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
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
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
                          setAppliedFilters(prev => ({ ...prev, doctorName: s.label }));
                          setShowSuggestions(false);
                          // We use setTimeout to allow state to settle or just call it directly with the value
                          const updated = { ...searchData, doctorName: s.label };
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('doctorName', s.label);
                          router.replace(`/patient/doctors?${params.toString()}`);
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
                onClick={handleApplyFilters}
                className="flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black rounded-2xl transition-all duration-300 text-sm shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Browse by Specialty</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPECIALTY_CARDS.map(({ label, emoji }) => {
              const isActive = appliedFilters.specialist === label
              return (
                <button
                  key={label}
                  onClick={() => handleSpecialtyCardClick(label)}
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border text-center transition-all duration-200 ${isActive
                    ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/25 scale-[1.04]'
                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 hover:scale-[1.03]'
                    }`}
                >
                  <span className="text-2xl leading-none">{emoji}</span>
                  <span className="text-[11px] font-semibold leading-tight">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {loading ? 'Finding doctors...' : `${filteredDoctors.length} Doctor${filteredDoctors.length !== 1 ? 's' : ''} Found`}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Verified doctors · Minimum wait-time</span>
            </div>
            {(userCity || appliedFilters.locationName) && !hasActiveFilters && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-xs text-teal-600 font-semibold capitalize">Showing doctors near {appliedFilters.locationName || userCity}</span>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {appliedFilters.doctorName && <FilterPill label={`Search: ${appliedFilters.doctorName}`} onRemove={() => handleRemoveFilter('doctorName')} />}
              {appliedFilters.locationName && <FilterPill label={`Near: ${appliedFilters.locationName}`} onRemove={() => handleRemoveFilter('lat')} />}
              {appliedFilters.specialist && <FilterPill label={appliedFilters.specialist} onRemove={() => handleRemoveFilter('specialist')} />}
              {appliedFilters.state && <FilterPill label={appliedFilters.state} onRemove={() => handleRemoveFilter('state')} />}
              {appliedFilters.area && <FilterPill label={`Area: ${appliedFilters.area}`} onRemove={() => handleRemoveFilter('area')} />}
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="p-5 flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2.5">
                  <div className="h-10 bg-orange-50 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.some(d => d.isNearbyRecommendation) && (
              <div className="col-span-full mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-rose-900 leading-tight">No doctors found in "{appliedFilters.locationName}"</h4>
                      <p className="text-sm text-rose-700 font-medium">But don’t worry, these are the doctors closest to you:</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-white px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">Nearby Suggestions</span>
                  </div>
                </div>
              </div>
            )}

            {filteredDoctors.map(doctor => {
              const features = doctor.currentPlan?.features || {}
              const planIsActive = doctor.currentPlan?.isActive === true
              const hasOnlineBooking = planIsActive && features.onlineBooking === true
              const hasOnlineConsult = planIsActive && features.onlineConsultation === true
              const isVerified = planIsActive && features.verifiedBadge === true
              const searchBoost = planIsActive ? (features.searchBoost || 0) : 0
              const doctorClinicNames = [...new Set((doctor.availability || []).map(a => a.location?.clinicName).filter(Boolean))]
              const hasClinic = doctorClinicNames.length > 0 || (doctor.availability || []).some(a => { const m = a.consultationMode?.toLowerCase(); return m === 'offline' || m === 'both'; })
              const name = doctor.basicInfo?.fullName || doctor.name
              const specialty = doctor.professionalInfo?.specialization || doctor.specialty
              const profileImage = doctor.basicInfo?.profileImage
              const doctorCityRaw = [doctor.basicInfo?.location, doctor.basicInfo?.area, doctor.basicInfo?.state, doctor.basicInfo?.city].filter(Boolean).join(' ').toLowerCase()
              const isNearby = userCity && doctorCityRaw.includes(userCity)

              return (
                <div
                  key={doctor._id || doctor.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all duration-300">
                          <DoctorAvatar src={profileImage} name={name} size="lg" />
                        </div>
                        {isVerified && (
                          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                            <BadgeCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-slate-800 truncate leading-tight">{name}</h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {doctor.distance !== undefined && doctor.distance !== Infinity && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                                {doctor.distance.toFixed(1)} km
                              </span>
                            )}
                            {isNearby && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-semibold">
                                <MapPin className="w-2.5 h-2.5" /> Nearby
                              </span>
                            )}
                            {searchBoost > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-semibold">
                                <Zap className="w-2.5 h-2.5" /> Top
                              </span>
                            )}
                          </div>
                        </div>

                        {isVerified && (
                          <span className="inline-block text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold mb-1">
                            ✓ Verified
                          </span>
                        )}

                        <div className="flex items-center gap-1 text-teal-600 text-xs font-semibold mt-0.5">
                          <Stethoscope className="w-3 h-3" />
                          {specialty || '—'}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span className="truncate">{doctor.professionalInfo?.qualification || '—'}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {hasOnlineConsult && (
                            <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                              <Wifi className="w-2.5 h-2.5" /> Online
                            </span>
                          )}
                          {hasOnlineBooking && (
                            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                              <Calendar className="w-2.5 h-2.5" /> Bookable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        {doctor.professionalInfo?.experience ? `${doctor.professionalInfo.experience} yrs exp` : 'Experience N/A'}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Consultation</p>
                        <p className="text-lg font-black text-teal-600">₹{doctor.professionalInfo?.consultationFee || 500}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mx-5 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</p>
                    <AvailabilityBlock availability={doctor.availability} />
                  </div>

                  <div className="px-5 pb-5 mt-auto space-y-2.5">
                    {hasOnlineBooking ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {hasClinic && (
                            <button
                              onClick={() => handleBookAppointment(doctor._id || doctor.id, 'offline')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-md shadow-teal-500/10 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              Visit Clinic
                            </button>
                          )}
                          <button
                            onClick={() => handleBookAppointment(doctor._id || doctor.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-md shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 cursor-not-allowed select-none">
                        <Calendar className="w-3.5 h-3.5" />
                        Booking Unavailable
                      </div>
                    )}

                    <button
                      onClick={() => handleViewProfile(doctor._id || doctor.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-teal-500 text-teal-600 font-semibold text-sm rounded-xl hover:bg-teal-500 hover:text-white transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-5">
                  <MapPin className="w-10 h-10 text-rose-300" />
                </div>
                <h3 className="text-slate-700 font-bold text-xl mb-2">No doctors in this location</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                  We couldn't find any doctors in <span className="font-bold text-slate-600">"{appliedFilters.locationName}"</span>.
                  Try searching in a different city or clearing filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </section >
  )
}
