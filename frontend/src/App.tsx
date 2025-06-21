import './App.css'
import 'bootstrap'
import Chart from './Chart.jsx'
import OptionsMenu from './OptionsMenu.jsx'
import ImpliedVolCurve from './ImpliedVolCurve.jsx'

function App() {
  return (
    <>
      <div className="bg-black text-white font-bold mb-4">
        Black Scholes + Binomial Pricing Dashboard Application
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-1/1 row-gap-2">
        <div className="bg-white text-black font-bold col-span-2 h-1/1">
          <Chart />
        </div>

        <div className="bg-white text-black font-bold">
          <ImpliedVolCurve />
        </div>

        <div className="bg-white text-black font-bold">
          <OptionsMenu />
        </div>
      </div>
    </>
  )
}

export default App
