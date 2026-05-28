// Transform functions for different scaling behaviors
export const LINEAR = (v: number) => v
export const SQUARED = (v: number) => v * v
export const LOGARITHMIC = (v: number) => Math.log10(1 + v * 9)
