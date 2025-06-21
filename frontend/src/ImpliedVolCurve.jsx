import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import 'plotly.js/dist/plotly.min.js'
import { surfaceData, dynamicMatrix, surfacePlotData } from './types/types'
import { PlotParams } from 'react-plotly.js'

/**
 * validateSurfaceData function
 *
 * @description
 * This function takes a surfaceData object and checks to make sure that all the dimensions are the same
 * for the moneyness matrix, time_to_expiry matrix, and implied volatility matrix.
 *
 * @param data    (a surfaceData object which we validate to make sure everything works!)
 */
const validateSurfaceData = (data: surfaceData): boolean => {
  /** Here we validate that the moneyness, time_to_expiry, and implied_volatility matrices are all the same size
   * aditionally, we check to see that the data is non empty, and that it exists, doing all of this at runtime.
   */
  const valid =
    data &&
    data.moneyness.length === data.time_to_expiry.length &&
    data.time_to_expiry.length === data.implied_volatility.length &&
    data.moneyness.length > 0 &&
    data.time_to_expiry.length > 0 &&
    data.implied_volatility.length > 0 &&
    data.moneyness[0]?.length === data.time_to_expiry[0]?.length &&
    data.time_to_expiry[0]?.length == data.implied_volatility[0]?.length
  return valid
}

/**
 * ImpliedVolCurve Component
 *
 * @description
 * This component handles creating the 3d volatility surface which we can see in the main portion of the dashboard.
 * The implied volatility surface keeps track of the state of the moneyness, timeToExpiry, and impliedVol grids, which
 * it then rerenders based on updates to state variables given to these three variables. Additionally, we make a call to the
 * backend get_market_data endpoint/ API at the beginning of the component attachment, to get the initial data. This is done
 * in the useEffect hook.
 *
 * @todo dynamic sizing (styling), be able to detach and move this visualization around.
 * @todo button to refresh/ get the implied vol curve for a given ticker
 * @todo add caching to the data (we only get the most recent data using streaming)
 * @todo annotation of types using plotly's types
 *
 * @returns ImpliedVolCurve Component
 * @component
 * @example
 * <ImpliedVolCurve/>
 */
function ImpliedVolCurve() {
  /** a m x n matrix storing the moneyness values*/
  const [moneyness, setMoneyness] = useState<dynamicMatrix>([
    [0],
  ] as dynamicMatrix)

  /** a m x n matrix storing the timeToExpiry values*/
  const [timeToExpiry, setTimeToExpiry] = useState<dynamicMatrix>([
    [0],
  ] as dynamicMatrix)

  /** a m x n matrix storing the impliedVolatility values*/
  const [impliedVol, setImpliedVol] = useState<dynamicMatrix>([
    [0],
  ] as dynamicMatrix)

  /**
   * Fetches volatility data from the backend API
   *
   * @description
   * This effect runs once on component mount
   *
   * @dependencies [] - Empty dependency array so it only runs once
   */
  useEffect(() => {
    /**
     * get_volatility_data function
     *
     * @description
     * This function fetches volatility data from the backend API, validates that it is in the
     * right form at runtime, and then sets the moneyness, time_to_expiry, and implied_volatility state
     * variables
     */
    const get_volatility_data = async (): Promise<void> => {
      try {
        const response = await fetch(
          'http://localhost:8000/get_market_data/TSLA',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        let volatilityData: surfaceData = await response.json()
        // here we check to see if the surface data is in the right format
        if (!validateSurfaceData(volatilityData)) {
          throw new Error(
            "Invalid surface data: dimensions do not match or data doesn't exist!"
          )
        } else {
          /** update the moneyness, time_to_expiry, and implied_volatility matrices given the new data */
          setMoneyness(volatilityData.moneyness)
          setTimeToExpiry(volatilityData.time_to_expiry)
          setImpliedVol(volatilityData.implied_volatility)
        }
      } catch (error) {
        console.log(
          'Error fetching data: ',
          moneyness,
          timeToExpiry,
          impliedVol
        )
      }
    }
    get_volatility_data()
  }, [])

  const data: surfacePlotData = [
    {
      type: 'surface',
      mode: 'lines+markers',
      x: moneyness,
      y: timeToExpiry,
      z: impliedVol,
      colorscale: 'Viridis',
      showscale: true,
    },
  ]

  /** creates the implied volatility surface using plotly's surface plot */
  return (
    <div
      key={`${moneyness.length}-${timeToExpiry.length}-${impliedVol.length}`}
    >
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Implied Volatility Curve',
            font: {
              size: 24,
            },
          },
          autosize: true,
          width: 700,
          height: 350,
          margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
          },
          scene: {
            xaxis: {
              title: {
                text: 'Moneyness (S/K)',
                font: {
                  size: 14,
                  color: '#000000',
                },
              },
              showgrid: true,
              zeroline: true,
            },
            yaxis: {
              title: {
                text: 'Time to Expiry (T) in Years',
                font: {
                  size: 14,
                  color: '#000000',
                },
              },
              showgrid: true,
              zeroline: true,
            },
            zaxis: {
              title: {
                text: 'Implied Volatility',
                font: {
                  size: 14,
                  color: '#000000',
                },
              },
              showgrid: true,
              zeroline: true,
            },
          },
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: true,
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default ImpliedVolCurve
