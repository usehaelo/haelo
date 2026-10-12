import { apiFetch } from './client'

export const connectEmail = async (provider: 'gmail.com' | 'zoho.com') => {
  return await apiFetch('/api/onboard/email', {
    method: 'POST',
    body: JSON.stringify({ provider })
  })
}

export const saveDomain = async (domain: string) => {
  return await apiFetch('/api/onboard/domain', {
    method: 'POST',
    body: JSON.stringify({ domain })
  })
}

export const getDomain = async () => {
  return await apiFetch('/api/onboard/domain', {
    method: 'GET'
  })
}

export const getWhatsappNumber = async () => {
  return await apiFetch('/api/onboard/whatsapp/number', {
    method: 'GET'
  })
}

export const addWhatsappNumber = async (phone: string) => {
  return await apiFetch('/api/onboard/whatsapp/add-number', {
    method: 'POST',
    body: JSON.stringify({ phone })
  })
}

export const verifyWhatsappNumber = async (phone: string, otp: string) => {
  return await apiFetch('/api/onboard/whatsapp/verify-number', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  })
}

export const uploadBibleFiles = async (formData: FormData) => {
  return await apiFetch('/api/bible/upload', {
    method: 'POST',
    body: formData
  })
}

export const getBibleMetrics = async () => {
  return await apiFetch('/api/bible/metrics', {
    method: 'GET'
  })
}

export const saveHaeloTone = async (tone: string) => {
  return await apiFetch('/api/onboard/haelo-tone', {
    method: 'POST',
    body: JSON.stringify({ tone })
  })
}

export const saveTimerConfig = async (payload: { timer?: string, timerConfig?: { sendAfter?: number, remindAfter?: number } }) => {
  return await apiFetch('/api/onboard/haelo-tone', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export const getHaeloTone = async () => {
  return await apiFetch('/api/onboard/haelo-tone', {
    method: 'GET'
  })
}

export const getProviders = async () => {
  return await apiFetch('/api/onboard/providers', {
    method: 'GET'
  })
}

export const getNotificationSettings = async () => {
  return await apiFetch('/api/onboard/notifications', {
    method: 'GET'
  })
}

export const saveNotificationSettings = async (payload: {
  unrecognizedSenderAlerts: boolean;
  dailyActivitySummary: boolean;
  weeklyPerformanceReport: boolean;
  errorAndConnectionAlerts: boolean;
}) => {
  return await apiFetch('/api/onboard/notifications', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
export const revokeEmailAccess = async (providerUId: string) => {
  return await apiFetch(`/api/onboard/email/${providerUId}`, {
    method: 'DELETE'
  })
}

