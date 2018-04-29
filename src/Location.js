class Location {
  constructor(latitude, longitude) {
    this.latitude = latitude
    this.longitude = longitude
  }

  toRadians(x) {
    return x * Math.PI / 180
  }

  distanceFrom(location) {  // distance in meter using the Haversine formula
    const R = 6378137       // Earth’s mean radius in meter
    const dLat = this.toRadians(this.latitude - location.latitude)
    const dLong = this.toRadians(this.longitude - location.longitude)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location.latitude)) * Math.cos(this.toRadians(this.latitude)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
  }
}

module.exports = {
  Location: Location,
}
