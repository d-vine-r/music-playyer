import type { LocationData } from "@/types"

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    try {
      // Try to get precise location first
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      // Use reverse geocoding to get location details
      const locationData = await this.reverseGeocode(position.coords.latitude, position.coords.longitude)

      return locationData
    } catch (error) {
      // Fallback to IP-based location
      return this.getLocationFromIP()
    }
  }

  private static async reverseGeocode(lat: number, lon: number): Promise<LocationData> {
    // In a real app, you'd use a service like Google Maps API or OpenStreetMap
    // For demo purposes, we'll simulate based on coordinates

    // Simulate some major cities
    const cities = [
      { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, timezone: "Africa/Lagos" },
      { name: "Ogun" , country: "Nigeria", lat: 7.0833, lon: 3.3667, timezone: "Africa/Lagos" },
      { name: "Abuja", country: "Nigeria", lat: 9.0575, lon: 7.49508, timezone: "Africa/Lagos" },
      { name: "Port Harcourt", country: "Nigeria", lat: 4.8156, lon: 7.0498, timezone: "Africa/Lagos" },
    ]

    // Find closest city (simplified)
    let closestCity = cities[0]
    let minDistance = this.calculateDistance(lat, lon, cities[0].lat, cities[0].lon)

    cities.forEach((city) => {
      const distance = this.calculateDistance(lat, lon, city.lat, city.lon)
      if (distance < minDistance) {
        minDistance = distance
        closestCity = city
      }
    })

    return {
      city: closestCity.name,
      country: closestCity.country,
      latitude: lat,
      longitude: lon,
      timezone: closestCity.timezone,
    }
  }

  private static async getLocationFromIP(): Promise<LocationData> {
    // Simulate IP-based location detection
    // In a real app, you'd use a service like ipapi.co or similar
    return {
      city: "San Francisco",
      country: "United States",
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: "America/Los_Angeles",
    }
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}
