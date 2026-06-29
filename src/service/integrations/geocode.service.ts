// geocode.service.ts
import axios from 'axios'

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY!

type OpenCageResult = {
  formatted: string
  geometry: {
    lat: number
    lng: number
  }
  components: {
    city?: string
    town?: string
    village?: string
    country: string
    [key: string]: string | undefined
  }
}

type OpenCageResponse = {
  results: OpenCageResult[]
}

export async function geocodeAddress(address: string) {
  const url = 'https://api.opencagedata.com/geocode/v1/json'

  const response = await axios.get<OpenCageResponse>(url, {
    params: {
      q: address,
      key: OPENCAGE_API_KEY,
      limit: 1
    }
  })

  const result = response.data.results?.[0]
  if (!result) throw new Error("No location found")

  return {
    latitude: result.geometry.lat,
    longitude: result.geometry.lng,
    formatted: result.formatted
  }
}


export async function resolveCoordinates(latitude: number, longitude: number) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
  const { data } = await axios.get<OpenCageResponse>(url)

  console.log('location resolve data: ', data)

  const details = data.results[0].components
  return {
    city: details.city || details.town || details.village,
    country: details.country,
    countryCode: details["ISO_3166-1_alpha-2"],
  }
}


