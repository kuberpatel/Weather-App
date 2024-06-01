/** @format */

export function metersToKilometers(visibilityInMeters: any): string {
  const visibilityInKilometers = visibilityInMeters / 1000;
  return `${visibilityInKilometers.toFixed(0)}km`; // Round to 0 decimal places and add 'km' unit
}
