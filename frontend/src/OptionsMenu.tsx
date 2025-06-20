import { useState, FormEvent, ChangeEvent } from 'react'
import OptionsMenuField from './OptionsMenuField'
import {
  formData,
  OptionPriceResponse,
  JsonString,
  stringifyJson,
} from './types/form'

/**
 * Options Menu Component
 *
 * @description
 * This component is the form which the user uses to input the parameters for the
 * Black Scholes and Binomial Pricing Models. Currently, it defaults to the TSLA stock,
 * and only calculates the price of a call option. Although in the future, it will have
 * radio buttons to select the type of option (call or put), stock ticker, whether or not the
 * option is American, European, or Asian, alongside whether to use the binomial model or
 * the Black Scholes model.
 *
 * @todo Add input validation for all fields (volatility, time-to-expiry, etc. as fractions/percentages)
 * @todo Add hints/tips for the user to input the correct data/ type validation
 * @todo Add radio buttons to select the type of option (call or put)
 * @todo Add radio buttons to select the type of option (American, European, or Asian)
 * @todo Add radio buttons to select the model (Black Scholes or Binomial)
 * @todo Add a dropdown menu to select the stock ticker
 * @todo Add support for European and Asian call and put options
 *
 * @returns Options Menu Component
 * @component
 * @example
 * <OptionsMenu/>
 **/
function OptionsMenu() {
  // ================================================
  // State Variables/ State Management
  // ================================================

  /**
   * Form data state
   * The form data/ parameters necessary to calculate the price of an option
   * using the Black Scholes and Binomial Pricing Models.
   */
  const [formData, setFormData] = useState<formData>({
    stock: 'TESLA',
    'strike-price': '254.00',
    'risk-free-rate': '0.0212',
    'time-to-expiry': '0.272727',
    volatility: '0.37',
    'current-stock-price': '245.00',
  })

  /**
   * Options price state
   * The calculated price of the option at the current time given the inputs given by the form data.
   **/
  const [optionPrice, setOptionPrice] = useState<number>(0.0)

  /**
   * Handles form submission and uses the formData state to fetch option price via the API in the backend
   *
   * @param e - submit form event
   * @returns Promise<void>
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    // prevent default form submission/ refreshing of page upon form submission
    e.preventDefault()
    // trys to send a POST request to the get_opt_price endpoint, the response should contain the option price
    // and is of the type
    try {
      const requestBody: JsonString<formData> =
        stringifyJson<formData>(formData)
      const response = await fetch('http://localhost:8000/get_opt_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      })
      const data: OptionPriceResponse = await response.json()
      setOptionPrice(data.data.optionPrice)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Handles the change event for the form input fields
   *
   * @param e - change event
   * @returns void
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // prevent default form submission/ refreshing of page upon form submission
    e.preventDefault()
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      {/**Create a form which on submission sends a GET request to the get_opt_price API */}
      <form
        onSubmit={handleSubmit}
        className="bg-blue-100 m-4 rounded-lg shadow-md"
      >
        {/**Text field for changing the STOCK Ticker */}
        <OptionsMenuField
          formData={formData}
          field="stock"
          handleChange={handleChange}
          label="Stock"
        />

        {/**Text field for changing the current STOCK Price */}
        <OptionsMenuField
          formData={formData}
          field="strike-price"
          handleChange={handleChange}
          label="Strike Price"
        />

        {/**Text field for changing the current risk-free-rate */}
        <OptionsMenuField
          formData={formData}
          field="risk-free-rate"
          handleChange={handleChange}
          label="Risk Free Rate"
        />

        {/**Text field for changing the current time to expiry (as a fraction of years till expiry) */}
        <OptionsMenuField
          formData={formData}
          field="time-to-expiry"
          handleChange={handleChange}
          label="Time To Expiry"
        />

        {/**Text field for the volatility input as a percentage */}
        <OptionsMenuField
          formData={formData}
          field="volatility"
          handleChange={handleChange}
          label="Volatility"
        />

        {/**Text field for inputting the current stock price which is then turned into a float! */}
        <OptionsMenuField
          formData={formData}
          field="current-stock-price"
          handleChange={handleChange}
          label="Current Stock Price"
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
        >
          Get your Option Price!
        </button>
      </form>
      Option Price: {optionPrice}
    </>
  )
}

export default OptionsMenu
