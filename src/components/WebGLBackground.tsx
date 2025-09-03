import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { inSphere } from 'maath/random'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

function StarField({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Points>(null)
  const [sphere] = useState(() => {
    // Ensure we always return a Float32Array
    const positions = inSphere(new Float32Array(12000 * 3), { radius: 2.5 })
    return positions instanceof Float32Array ? positions : new Float32Array(positions)
  })

  // Create colors for stars
  const colors = useMemo(() => {
    const cols = new Float32Array(12000 * 3)
    for (let i = 0; i < 12000; i++) {
      // Create a mix of white, blue, and yellow stars for more visual interest
      const starType = Math.random()
      if (starType < 0.7) {
        // White stars (most common)
        cols[i * 3] = 1
        cols[i * 3 + 1] = 1
        cols[i * 3 + 2] = 1
      } else if (starType < 0.85) {
        // Blue stars
        cols[i * 3] = 0.7 + Math.random() * 0.3
        cols[i * 3 + 1] = 0.7 + Math.random() * 0.3
        cols[i * 3 + 2] = 1
      } else {
        // Yellow/orange stars
        cols[i * 3] = 1
        cols[i * 3 + 1] = 0.8 + Math.random() * 0.2
        cols[i * 3 + 2] = 0.4 + Math.random() * 0.2
      }
    }
    return cols
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      // More dynamic rotation with intensity-based speed
      ref.current.rotation.x -= delta / 8 * intensity
      ref.current.rotation.y -= delta / 12 * intensity
      ref.current.rotation.z -= delta / 20 * intensity
      
      // Add subtle pulsing effect to stars
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      const time = state.clock.elapsedTime
      for (let i = 0; i < positions.length; i += 3) {
        const pulse = Math.sin(time * 2 + i * 0.01) * 0.01 * intensity
        positions[i] += pulse
        positions[i + 1] += pulse
        positions[i + 2] += pulse
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.9 * intensity}
          vertexColors
        />
      </Points>
    </group>
  )
}

export default function WebGLBackground({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ambientLight intensity={0.1} />
        <StarField intensity={intensity} />
      </Canvas>
    </div>
  )
}