import ReactApexChart from "react-apexcharts";
import { useState, useEffect } from "react";

interface CandlestickDataPoint {
  x: number; // timestamp in ms
  y: [number, number, number, number]; // open, high, low, close
}

interface CandleStickSeries {
  data: CandlestickDataPoint[];
  name: string;
}

interface CandleStickChartConfig {
  series: CandleStickSeries[];
  options: {
    chart: {
      type: "candlestick";
      height: number;
    };
    title: {
      text: string;
      align: "left" | "center" | "right";
    };
    xaxis: {
      type: "datetime";
    };
    yaxis: {
      tooltip: {
        enabled: boolean;
      };
    };
  };
}

function Chart() {
  const [data, setData] = useState<CandleStickChartConfig>({
    // the data is open, high, low close
    series: [
      {
        data: [],
        name: "Candlestick",
      },
    ],
    options: {
      chart: {
        type: "candlestick",
        height: 350,
      },
      title: {
        text: "CandleStick Chart",
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    },
  });

  useEffect(() => {
    const fetchCandleStickData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_candlestick_data/TSLA",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        let formattedData = await response.json();
        formattedData = formattedData.data.map((item: any) => ({
          x: new Date(item.Date).getTime(),
          y: [
            Number(item.Open),
            Number(item.High),
            Number(item.Low),
            Number(item.Close),
          ],
        }));

        setData({
          series: [
            {
              data: Object.values(formattedData),
              name: "Candlestick",
            },
          ],
          options: data["options"],
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchCandleStickData();
  }, []);

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
  );
}

export default Chart;
