import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  providerSignup,
  providerSignin,
  getProviderMe,
  updateProviderMe,
  providerCreateHospital,
  providerGetMyHospitals,
  providerGetHospitalById,
  providerUpdateHospital,
  providerDeleteHospital,
  providerToggleActiveStatus,
  providerAddDoctor,
  providerRemoveDoctor,
} from '../services/provider.service'

const KEYS = {
  all:      ['provider'],
  me:       ['provider', 'me'],
  hospitals: (params) => ['provider', 'hospitals', params],
  detail:   (id) => ['provider', 'hospitals', 'detail', id],
}

export const useProviderSignup = () => {
  return useMutation({ mutationFn: (body) => providerSignup(body) })
}

export const useProviderSignin = () => {
  return useMutation({ mutationFn: (body) => providerSignin(body) })
}

export const useGetProviderMe = () => {
  return useQuery({
    queryKey: KEYS.me,
    queryFn: async () => {
      const { data } = await getProviderMe()
      return data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export const useUpdateProviderMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => updateProviderMe(body),
    onSuccess: (response) => {
      queryClient.setQueryData(KEYS.me, (old) => ({
        ...old,
        provider: response?.data?.provider ?? old?.provider,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.me })
    },
  })
}

export const useProviderGetMyHospitals = (params = {}, options = {}) => {
  return useQuery({
    queryKey: KEYS.hospitals(params),
    queryFn: async () => {
      const { data } = await providerGetMyHospitals(params)
      return data
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  })
}

export const useProviderGetHospitalById = (id) => {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const { data } = await providerGetHospitalById(id)
      return data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const useProviderCreateHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => providerCreateHospital(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'hospitals'] })
    },
  })
}

export const useProviderUpdateHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => providerUpdateHospital(id, body),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(KEYS.detail(id), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['provider', 'hospitals'] })
    },
  })
}

export const useProviderDeleteHospital = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => providerDeleteHospital(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['provider', 'hospitals'] })
    },
  })
}

export const useProviderToggleActiveStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => providerToggleActiveStatus(id),
    onSuccess: (response, id) => {
      queryClient.setQueryData(KEYS.detail(id), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['provider', 'hospitals'] })
    },
  })
}

export const useProviderAddDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hospitalId, doctorId }) => providerAddDoctor({ hospitalId, doctorId }),
    onSuccess: (response, { hospitalId }) => {
      queryClient.setQueryData(KEYS.detail(hospitalId), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(hospitalId) })
    },
  })
}

export const useProviderRemoveDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hospitalId, doctorId }) => providerRemoveDoctor({ hospitalId, doctorId }),
    onSuccess: (response, { hospitalId }) => {
      queryClient.setQueryData(KEYS.detail(hospitalId), (old) => ({
        ...old,
        hospital: response?.data?.hospital ?? old?.hospital,
      }))
      queryClient.invalidateQueries({ queryKey: KEYS.detail(hospitalId) })
    },
  })
}
