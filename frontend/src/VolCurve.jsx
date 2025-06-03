import {useState, useMemo} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import * as THREE from "three";

function Surface() {
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