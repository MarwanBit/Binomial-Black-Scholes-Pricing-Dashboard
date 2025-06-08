import {useState, useMemo, useEffect} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import * as THREE from "three";

function Surface() {
    const [data, setData] = useState({});
    
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
                    moneyness: (item["S0"] / item["K"]),
                }));
                console.log(volatilityData);
            } catch (error) {
                console.log("Error fetching data: ", data);
            }
        }
        get_volatility_data();
    },[]);

    const Geometry = useMemo(() => {
        const Geometry = new THREE.PlaneGeometry(10,10,100,100);
        const positionAttr = Geometry.attributes.position;

        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i);
            const y = positionAttr.getY(i);
            const z = Math.sin(x*2)*Math.cos(y*2);
            positionAttr.setZ(i,z);
        }

        Geometry.computeVertexNormals();
        return Geometry;
    }, []);

    return (
        <mesh geometry={Geometry} rotation-x={-Math.PI/2}>
            <meshStandardMaterial color="skyblue" wireframe={false}/>
        </mesh>
    );
}

function VolCurve() {

    return (
        <Canvas camera={{position:[0,10,10], fov:60}}>
            <ambientLight />
            <pointLight position={[10,10,10]}/>
            <Surface />
            <OrbitControls />
        </Canvas>
    );
}

export default VolCurve;