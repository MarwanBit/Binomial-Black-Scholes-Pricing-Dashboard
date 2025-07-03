import React, { ChangeEvent } from 'react'

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

/**
 * @description
 * a m x n matrix of numbers (floats) which we use for creating the 3d-vol surface
 */
export type twoD_matrix = Array<Array<number>> & { __brand: 'twoD_matrix' }

/**
 * @description
 * Branded type for a matrix of specific dimensions
 */
export type Matrix<M extends number, N extends number> = Array<
  Array<number>
> & {
  /** the brand for type matching/ identification */
  __brand: `matrix_${M}x${N}`

  /**the number of rows of the matrix */
  __rows: M

  /**the number of columns of the matrix */
  __cols: N
}

/**
 * @description
 * a dynamic matrix type which determines its size at runtime
 */
export type dynamicMatrix = Array<Array<number>> & { __brand: 'dynamicMatrix' }

/**
 * @description
 * Helper function to create the matrix of size M and N
 */
export function createMatrix<M extends number, N extends number>(
  data: Array<Array<number>>,
  rows: M,
  cols: N
): Matrix<M, N> | null {
  if (data.length !== rows || data.some((row) => row.length != cols)) {
    return null
  }
  return data as Matrix<M, N>
}

/**
 * @description
 * the surface data which consists of three m x n matrices (of floats) which are used to specify
 * the moneyness, time_to_expiry, and implied volatility (x,y,z) for each point on the volatility surface
 *
 * @note the dimensions of moneyness, time_to_expiry, and implied volatility must match!
 */
export interface surfaceDataDimensions<M extends number, N extends number> {
  /** matrix of floats  */
  moneyness: Matrix<M, N>
  time_to_expiry: Matrix<M, N>
  implied_volatility: Matrix<M, N>
}

/**
 * @description
 * the surface data which consists of three m x n matrices, but we don't check that the dimensions agree, so it
 * is a more general type
 */
export interface surfaceData {
  moneyness: dynamicMatrix
  time_to_expiry: dynamicMatrix
  implied_volatility: dynamicMatrix
}

/**
 * @description
 * shows that a Candlestick consists of a time, and a tuple (open, high, low, close)
 */
export interface CandlestickDataPoint {
  x: number // timestamp in ms
  y: [number, number, number, number] // open, high, low, close
}

/**
 * @description
 * describes a CandleStickSeries as a list of CandleSticks, alongside a name
 */
export interface CandleStickSeries {
  data: CandlestickDataPoint[]
  name: string
}

/**
 * @description
 * defines the CandleStickChartConfig which is the expected format for react-plotly plots,
 * containing a series which is a candlestickSeries type alongside some options for configuring the
 * chart
 */
export interface CandleStickChartConfig {
  series: CandleStickSeries[]
  options: {
    chart: {
      type: 'candlestick'
      height: number
    }
    title: {
      text: string
      align: 'left' | 'center' | 'right'
    }
    xaxis: {
      type: 'datetime'
    }
    yaxis: {
      tooltip: {
        enabled: boolean
      }
    }
  }
}

/**
 * @description
 *
 * the type which describes the formate of the data which is fed into the plotly API to
 * create the surface plot of the implied volatility surface
 */
export type surfacePlotData = [
  {
    type: 'surface'
    mode: 'lines+markers'
    x: dynamicMatrix
    y: dynamicMatrix
    z: dynamicMatrix
    colorscale: 'Viridis' | 'Magma' | 'Plasma' | 'Inferno' | 'Cividis'
    showscale: boolean
  },
]

/**
 * @description
 *
 * this type specifies the axis settings for the surface plot, for a particular
 * axis, which is contained in the scene object
 */
export interface surfacePlotAxis {
  title: {
    text: string
    font: {
      size: number
      color: string
    }
    showgrid: boolean
    zeroline: boolean
  }
}

/**
 * @description
 * the config for the surface plot, which gives us the options for how
 * the plot should be displayed, if it should be responsive etc.
 */
export interface surfacePlotConfig {
  responsive: boolean
  displayModeBar: boolean
  displaylogo: boolean
}

/**
 * @description
 *
 * the layout of the surface plot, which gives us the options for how
 * to format the plot, such as the title, size, margin, vol, titles, fonts, etc.
 */
export interface surfacePlotLayout {
  title: {
    text: string
    font: {
      size: number
    }
  }
  autosize: boolean
  width: number
  height: number
  margin: {
    l: number
    r: number
    b: number
    t: number
  }
  scene: {
    xaxis: surfacePlotAxis
    yaxis: surfacePlotAxis
    zaxis: surfacePlotAxis
  }
}

/**
 * @description
 * the combined bundle of information needed to specify a surfacePlot, contains
 * the surfacePlot Data, surface plot layout, and surface plot config
 */
export interface surfacePlotBundle {
  data: surfacePlotData
  layout: surfacePlotLayout
  config: surfacePlotConfig
}
