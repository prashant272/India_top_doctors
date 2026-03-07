import { API, baseURL } from "../utils/Utils"


export const createPlan = (body) => {
    const endpoint = `/plans/createplan`
    return API.post(endpoint, body)
}
export const getPlans = () => {
    const endpoint = `/plans/getplans`
    return API.get(endpoint)
}
export const updatePlan = (body, id) => {
    const endpoint = `/plans/updateplan/${id}`
    return API.put(endpoint, body)
}
export const deletePlan = (id) => {
    const endpoint = `/plans/deleteplan/${id}`
    return API.delete(endpoint)
}

export const purchasePlan = (body) => {
    const endpoint = `/plans/purchaseplan`;
    return API.post(endpoint, body);
};
