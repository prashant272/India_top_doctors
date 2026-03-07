import { API, baseURL } from "../utils/Utils"

export const addPrescription = (body)=>{
    const endpoint = `${baseURL}/prescription/addPrescription`
    return API.post(endpoint ,body)
}
export const getPrescription = ()=>{
    const endpoint = `${baseURL}/prescription/getPrescriptionsbyRole`
    return API.get(endpoint)
}
export const getPrescriptionById = (id)=>{
    const endpoint = `${baseURL}/prescription/getPrescriptionsbyId/${id}`
    return API.get(endpoint)
}