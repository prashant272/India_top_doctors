import { API } from "../utils/Utils";

export const getDoctors = async () => {
    const endpoint = `/patient/getdoctors`;
    return API.get(endpoint);
};

export const getDoctorDetails = async (id) => {
    return API.get(`/patient/doctor/${id}`);
};
