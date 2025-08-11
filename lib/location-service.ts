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
      { name: "New York", country: "United States", lat: 40.7128, lon: -74.006, timezone: "America/New_York" },
      { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
      { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
      { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
      { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, timezone: "America/Sao_Paulo" },
      { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777, timezone: "Asia/Kolkata" },
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
