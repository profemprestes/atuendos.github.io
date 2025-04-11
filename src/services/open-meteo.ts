/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents weather information, including temperature.
 */
export interface Weather {
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
}

/**
 * Asynchronously retrieves weather information for a given location.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to a Weather object containing temperature.
 */
export async function getWeather(location: Location): Promise<Weather> {
  // TODO: Implement this by calling an API.

  return {
    temperatureCelsius: 23,
  };
}
