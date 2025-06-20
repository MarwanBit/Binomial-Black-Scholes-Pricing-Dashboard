import { ChangeEvent } from 'react'

/**
 * @description
 * Represents the data/ parameters/ necessary inputs to calculate the
 * price of an option using the Black Scholes and Binomial Pricing models.
 *
 * @interface formData
 * @property {string} stock - The stock ticker of the option
 * @property {string} strike-price - The strike price of the option
 * @property {string} risk-free-rate - The risk free rate of the option
 * @property {string} time-to-expiry - The time to expiry of the option
 * @property {string} volatility - The volatility of the option
 * @property {string} current-stock-price - The current stock price of the option
 */
export interface formData {
  /**
   * The stock ticker of the option (queried from Yahoo Finance)
   */
  stock: string

  /**
   * The strike price of the option as a float
   */
  'strike-price': string

  /**
   * The risk free rate of the option as a percentage
   */
  'risk-free-rate': string

  /**
   * The time to expiry of the option as a fraction of a year
   */
  'time-to-expiry': string

  /**
   * The volatility of the option as a percentage
   */
  volatility: string

  /**
   * The current stock price of the option as a float
   */
  'current-stock-price': string
}

/**
 * @description
 * Represents the response fomr the get_opt_price API which includes the price of the option given
 * the inputs in the POST request sent to the python REST API
 *
 **/
export type OptionPriceResponse = {
  /** a string indicating whether or not the request was sucessfully processed or not */
  status: 'success' | 'fail'

  /** a human readable message indicating the status of the request and why such result occurred */
  message: string

  /**
   * the option price at time 0 corresponding the the parameters in the POST Request send to the
   * get_opt_price endpoint
   */
  data: {
    optionPrice: number
  }
}

/**
 * @description
 * represents a JSONString type as the intersection of the string type and data
 */
export type JsonString<T> = string & { __brand: 'json'; __data: T }

/**
 * @description
 * Helper function to create JSON strings
 */
export function stringifyJson<T>(data: T): JsonString<T> {
  return JSON.stringify(data) as JsonString<T>
}

/**
 * @description
 * the format of props which are passed down from the OptionsMenu to each of the individual fields
 */
export type OptionsMenuFieldProps = {
  /** the formData state variable passed down to each OptionMenuField for updating */
  formData: formData

  /** the field/ variable which the OptionsMenuField is responsible for updating */
  field: keyof formData

  /** the handleChange function which updates the formData state variable based upon change of the field*/
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void

  /** the string representation of the label */
  label: string
}
