import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap';
import Chart from "./Chart.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="bg-black text-white font-bold mb-4">
        Black Scholes + Binomial Pricing Dashboard Application
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-1/1 row-gap-2">

        <div className="bg-white text-black font-bold col-span-2 h-1/1">
          INSERT CANDLESTICK CHART HERE
          <Chart/>
        </div>

        <div className="bg-white text-black font-bold">
          INSERT VOLATILITY CURVE HERE
        </div>

        <div className="bg-white text-black font-bold">
          INSERT OPTIONS REQUEST HERE
        </div>

      </div>
    </>
  )
}

export default App;
