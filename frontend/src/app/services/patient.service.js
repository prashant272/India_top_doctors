const { baseURL, API } = require("../utils/Utils")


export const getDoctors = async () => {
    const endpoint = `/patient/getdoctors`;
    return API.get(endpoint)
}

export const getDoctoravailability = async (id) => {
    const endpoint = `/doctor/availability/${id}`
    return API.get(endpoint)
}
