import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import "plotly.js/dist/plotly.min.js";

type twoD_matrix = Array<Array<number>>;

interface surfaceData {
  moneyness: twoD_matrix;
  time_to_expiry: twoD_matrix;
  implied_volatility: twoD_matrix;
}

function ImpliedVolCurve() {
  const [moneyness, setMoneyness] = useState<twoD_matrix>([[0]]);
  const [timeToExpiry, setTimeToExpiry] = useState<twoD_matrix>([[0]]);
  const [impliedVol, setImpliedVol] = useState<twoD_matrix>([[0]]);

  useEffect(() => {
    const get_volatility_data = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_market_data/TSLA",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        let volatilityData: surfaceData = await response.json();
        console.log("Received volatility data: ", volatilityData);
        setMoneyness(volatilityData.moneyness);
        setTimeToExpiry(volatilityData.time_to_expiry);
        setImpliedVol(volatilityData.implied_volatility);
      } catch (error) {
        console.log(
          "Error fetching data: ",
          moneyness,
          timeToExpiry,
          impliedVol,
        );
      }
    };
    get_volatility_data();
  }, []);

  useEffect(() => {
    console.log("State updated:", {
      moneyness,
      timeToExpiry,
      impliedVol,
    });
  }, [moneyness, timeToExpiry, impliedVol]);

  return (
    <div
      key={`${moneyness.length}-${timeToExpiry.length}-${impliedVol.length}`}
    >
      <Plot
        data={[
          {
            type: "surface",
            mode: "lines+markers",
            x: moneyness,
            y: timeToExpiry,
            z: impliedVol,
            colorscale: "Viridis",
            showscale: true,
          },
        ]}
        layout={{
          title: {
            text: "Implied Volatility Curve",
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
                text: "Moneyness (S/K)",
                font: {
                  size: 14,
                  color: "#000000",
                },
              },
              showgrid: true,
              zeroline: true,
            },
            yaxis: {
              title: {
                text: "Time to Expiry (T) in Years",
                font: {
                  size: 14,
                  color: "#000000",
                },
              },
              showgrid: true,
              zeroline: true,
            },
            zaxis: {
              title: {
                text: "Implied Volatility",
                font: {
                  size: 14,
                  color: "#000000",
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
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default ImpliedVolCurve;
