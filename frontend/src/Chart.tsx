import ReactApexChart from 'react-apexcharts'
import { useState, useEffect } from 'react'
import { CandleStickChartConfig } from './types/types'

/**
 * Chart Component
 *
 * @description
 * The Chart Component fetches data from the get_candlestick_api in the python backend in order to display
 * the candlestick data from the corresponding last X days, keeps the candlestick data in a state variable.
 *
 * @todo make the Candlestick dynamic, thus you can choose the range for which data to get, how frequent, which
 * stocks, etc.
 * @todo add the ability to add tabs/ maybe subscribe to different stocks to watch
 * @todo subscription based updates for the stocks/ stock data of interest (use Kafka or websockets to do this)
 * @todo add more zoom functionality, drag and drop, drawing on the charts, etc.
 *
 * @returns Chart Component
 * @component
 * @example
 * <Chart/>
 */
function Chart() {
  const [data, setData] = useState<CandleStickChartConfig>({
    // the data is open, high, low close
    series: [
      {
        data: [],
        name: 'Candlestick',
      },
    ],
    options: {
      chart: {
        type: 'candlestick',
        height: 350,
      },
      title: {
        text: 'CandleStick Chart',
        align: 'left',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    },
  })

  useEffect(() => {
    const fetchCandleStickData = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/get_candlestick_data/TSLA',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        let formattedData = await response.json()
        formattedData = formattedData.data.map((item: any) => ({
          x: new Date(item.Date).getTime(),
          y: [
            Number(item.Open),
            Number(item.High),
            Number(item.Low),
            Number(item.Close),
          ],
        }))

        setData({
          series: [
            {
              data: Object.values(formattedData),
              name: 'Candlestick',
            },
          ],
          options: data['options'],
        })
      } catch (error) {
        console.error('Error fetching data: ', error)
      }
    }
    fetchCandleStickData()
  }, [])

  return (
    <>
      <div id="chart">
        <ReactApexChart
          options={data.options as any}
          series={data.series}
          type="candlestick"
          height={350}
        />
      </div>
      <div id="html-dist"></div>
    </>
  )
}

export default Chart
