import { API, baseURL } from "../utils/Utils"

export const addPrescription = (body) => {
    const endpoint = `/prescription/addPrescription`
    return API.post(endpoint, body)
}
export const getPrescription = () => {
    const endpoint = `/prescription/getPrescriptionsbyRole`
    return API.get(endpoint)
}
export const getPrescriptionById = (id) => {
    const endpoint = `/prescription/getPrescriptionsbyId/${id}`
    return API.get(endpoint)
}