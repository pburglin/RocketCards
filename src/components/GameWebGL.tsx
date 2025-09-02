import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Text } from '@react-three/drei'
import { inSphere } from 'maath/random'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

function BattleParticles(props: { battleIntensity: number }) {
  const ref = useRef<THREE.Points>(null)
  const particleCount = 2000
  
  // Create particles with different colors based on battle intensity
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  })

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Red for player attacks, blue for opponent attacks, yellow for neutral
      const intensity = props.battleIntensity
      if (intensity > 0.7) {
        // Player attack - red/orange
        cols[i * 3] = 1
        cols[i * 3 + 1] = Math.random() * 0.5
        cols[i * 3 + 2] = 0
      } else if (intensity > 0.4) {
        // Opponent attack - blue/purple
        cols[i * 3] = Math.random() * 0.5
        cols[i * 3 + 1] = Math.random() * 0.3
        cols[i * 3 + 2] = 1
      } else {
        // Neutral - white/yellow
        cols[i * 3] = 1
        cols[i * 3 + 1] = 1
        cols[i * 3 + 2] = Math.random() * 0.5
      }
    }
    return cols
  }, [props.battleIntensity])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.1 * props.battleIntensity
      ref.current.rotation.y += delta * 0.05 * props.battleIntensity
      
      // Animate particles based on battle intensity
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] += (Math.random() - 0.5) * delta * props.battleIntensity * 0.5
        positions[i3 + 1] += (Math.random() - 0.5) * delta * props.battleIntensity * 0.5
        positions[i3 + 2] += (Math.random() - 0.5) * delta * props.battleIntensity * 0.5
        
        // Keep particles within bounds
        if (Math.abs(positions[i3]) > 5) positions[i3] *= 0.9
        if (Math.abs(positions[i3 + 1]) > 5) positions[i3 + 1] *= 0.9
        if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] *= 0.9
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <Points ref={ref} positions={positions} colors={colors} frustumCulled={false} {...props}>
      <PointMaterial
        transparent
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
      />
    </Points>
  )
}

function EnergyOrbs(props: { energyLevel: number }) {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2
      ref.current.rotation.x += delta * 0.1
    }
  })

  return (
    <group ref={ref}>
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI / 4) * 3,
            Math.cos(i * Math.PI / 4) * 2,
            Math.sin(i * Math.PI / 4) * Math.cos(i * Math.PI / 4)
          ]}
          scale={0.1 + props.energyLevel * 0.2}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? '#ff6b6b' : '#4ecdc4'} 
            transparent 
            opacity={0.7 + props.energyLevel * 0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function GameWebGL({ battleIntensity = 0, energyLevel = 0 }: { battleIntensity?: number; energyLevel?: number }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <BattleParticles battleIntensity={battleIntensity} />
        <EnergyOrbs energyLevel={energyLevel} />
      </Canvas>
    </div>
  )
}