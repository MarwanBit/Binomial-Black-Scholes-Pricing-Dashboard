import {useState, useMemo, useEffect} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import * as THREE from "three";
import Plot from 'react-plotly.js';
import 'plotly.js/dist/plotly.min.js';


function ImpliedVolCurve(){
    const [data, setData] = useState([]);

    const moneyness = [0.8, 0.9, 1.0, 1.1, 1.2];
    const timeToExpiry = [0.1, 0.2, 0.3, 0.4, 0.5];
    
    // Create a 2D array for z values
    const impliedVol = [
        [0.3, 0.35, 0.4, 0.45, 0.5],
        [0.35, 0.4, 0.45, 0.5, 0.55],
        [0.4, 0.45, 0.5, 0.55, 0.6],
        [0.45, 0.5, 0.55, 0.6, 0.65],
        [0.5, 0.55, 0.6, 0.65, 0.7]
    ];
    
    useEffect(() => {
        const get_volatility_data = async () => {
            try{
                const response = await fetch("http://localhost:8000/get_market_data/TSLA", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                let volatilityData = await response.json();
                volatilityData = volatilityData.data.map(item => ({
                    impliedVolatility: item["impliedVolatility"],
                    S0: item["S0"],
                    T: item["T"],
                    r: item["r"],
                    K: item["K"],
                    moneyness: item["K"] != 0 ? (item["S0"] / item["K"]) : 0, 
                }));
                setData(volatilityData);
                console.log(data);
            } catch (error) {
                console.log("Error fetching data: ", data);
            }
        }
        get_volatility_data();
    },[]);

    return (
    <div key={JSON.stringify(data)}>
        <Plot
            data={[
                {
                    type: 'surface',
                    mode: 'lines+markers',
                    x: moneyness,
                    y: timeToExpiry, 
                    z: impliedVol,
                    colorscale: "Viridis",
                    showcale: true
                }]}
            layout={{
                title: {
                    text: "Implied Volatility Curve",
                    font: {
                        size: 24
                    }
                },
                autosize: true,
                width: 700,
                height: 350,
                margin: {
                    l:65,
                    r:50,
                    b:65,
                    t:90
                },
                scene: {
                    xaxis: {
                        title: {
                            text: "Moneyness (S/K)",
                            font: {
                                size: 14,
                                color: "#000000"
                            }
                        },
                        showgrid: true,
                        zeroline: true
                    },
                    yaxis: {
                        title: {
                            text: "Time to Expiry (T) in Years",
                            font: {
                                size: 14,
                                color: "#000000"
                            }
                        },
                        showgrid: true,
                        zeroline: true
                    },
                    zaxis: {
                        title: {
                            text: "Implied Volatility",
                            font: {
                                size: 14,
                                color: "#000000"
                            }
                        },
                        showgrid: true,
                        zeroline: true
                    }

                }
                
            }}
            config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: true
            }}
            useResizeHandler={true}
            style={{width: "100%", height: "100%"}}
        />
    </div>
    );
}


export default ImpliedVolCurve;