const { baseURL, API } = require("../utils/Utils")


export const getDoctors = async()=>{    
    const endpoint = `${baseURL}/patient/getdoctors`;
    return API.get(endpoint)
}

export const getDoctoravailability = async(id)=>{
    const endpoint = `${baseURL}/doctor/availability/${id}`
    return API.get(endpoint)
}
