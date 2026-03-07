const SAFE_PATIENT_FIELDS = `
  basicInfo.fullName
  basicInfo.phone
  basicInfo.age
  basicInfo.gender
  basicInfo.bloodGroup
`

const SAFE_DOCTOR_FIELDS = `
  basicInfo.fullName
  basicInfo.profileImage
  professionalInfo.specialization
  professionalInfo.consultationFee
  professionalInfo.consultationFee
  availability
  hospitalAffiliations
`

const PUBLIC_DOCTOR_LIST_FIELDS = `
  basicInfo.fullName
  basicInfo.profileImage
  basicInfo.socialLinks
  professionalInfo.specialization
  professionalInfo.experience
  professionalInfo.consultationFee
  professionalInfo.qualification
  availability
  planDetails
  currentPlanName
  currentPlan
  hospitalAffiliations
`


module.exports = {
  SAFE_PATIENT_FIELDS,
  SAFE_DOCTOR_FIELDS,
  PUBLIC_DOCTOR_LIST_FIELDS
}