import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  hospitalSignup,
  hospitalSignin,
  getMe,
  updateMe,
  createHospital,
  getMyCreatedHospitals,
  getHospitals,
  getHospitalById,
  getNearbyHospitals,
  searchHospitals,
  updateHospital,
  deleteHospital,
  verifyHospital,
  toggleActiveStatus,
  addDoctor,
  removeDoctor,
} from '../services/hospital.service'

const KEYS = {
  all: ['hospitals'],
  me: ['hospitals', 'me'],
  list: (params) => ['hospitals', 'list', params],
  myCreated: (params) => ['hospitals', 'my-created', params],
  search: (q) => ['hospitals', 'search', q],
  detail: (id) => ['hospitals', 'detail', id],
  nearby: (coords) => ['hospitals', 'nearby', coords],
}

export const useHospitalSignup = () => {
  return useMutation({ mutationFn: (body) => hospitalSignup(body) })
}

export const useHospitalSignin = () => {
  return useMutation({ mutationFn: (body) => hospitalSignin(body) })
}

export const useGetMe = () => {
  return useQuery({
    queryKey: KEYS.me,
    queryFn: async () => {
      const { data } = await getMe()
      return data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => updateMe(body),
    onSuccess: (response) => {
      queryClient.setQueryData(KEYS.me, (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.me })
    },
  })
}

export const useGetHospitals = (params = {}) => {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: async () => {
      const { data } = await getHospitals(params)
      return data
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export const useGetMyCreatedHospitals = (params = {}) => {
  return useQuery({
    queryKey: KEYS.myCreated(params),
    queryFn: async () => {
      const { data } = await getMyCreatedHospitals(params)
      return data
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export const useSearchHospitals = (q = '') => {
  return useQuery({
    queryKey: KEYS.search(q),
    queryFn: async () => {
      const { data } = await searchHospitals(q)
      return data
    },
    enabled: q.trim().length > 0,
    staleTime: 1 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export const useGetHospitalById = (id) => {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const { data } = await getHospitalById(id)
      return data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const useGetNearbyHospitals = ({ lat, lng, distance } = {}) => {
  return useQuery({
    queryKey: KEYS.nearby({ lat, lng, distance }),
    queryFn: async () => {
      const { data } = await getNearbyHospitals({ lat, lng, distance })
      return data
    },
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => createHospital(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['hospitals', 'my-created'] })
    },
  })
}

export const useUpdateHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => updateHospital(id, body),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(KEYS.detail(id), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export const useDeleteHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteHospital(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['hospitals', 'my-created'] })
    },
  })
}

export const useVerifyHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => verifyHospital(id),
    onSuccess: (response, id) => {
      queryClient.setQueryData(KEYS.detail(id), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export const useToggleActiveStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => toggleActiveStatus(id),
    onSuccess: (response, id) => {
      queryClient.setQueryData(KEYS.detail(id), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export const useAddDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hospitalId, doctorId }) => addDoctor({ hospitalId, doctorId }),
    onSuccess: (response, { hospitalId }) => {
      queryClient.setQueryData(KEYS.detail(hospitalId), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(hospitalId) })
    },
  })
}

export const useRemoveDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hospitalId, doctorId }) => removeDoctor({ hospitalId, doctorId }),
    onSuccess: (response, { hospitalId }) => {
      queryClient.setQueryData(KEYS.detail(hospitalId), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(hospitalId) })
    },
  })
}
