import { API, baseURL } from "../utils/Utils"


export const createPlan = (body)=>{
    const endpoint = `${baseURL}/plans/createplan`
    return API.post(endpoint,body)
}
export const getPlans = ()=>{
    const endpoint = `${baseURL}/plans/getplans`
    return API.get(endpoint)
}
export const updatePlan = (body ,id)=>{
    const endpoint = `${baseURL}/plans/updateplan/${id}`
    return API.put(endpoint,body)
}
export const deletePlan = (id)=>{
    const endpoint = `${baseURL}/plans/deleteplan/${id}`
    return API.delete(endpoint)
}

export const purchasePlan = (body) => {
  const endpoint = `${baseURL}/plans/purchaseplan`;
  return API.post(endpoint, body);
};
