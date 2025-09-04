import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Text } from '@react-three/drei'
import { inSphere } from 'maath/random'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

function BattleParticles(props: { battleIntensity: number }) {
  const ref = useRef<THREE.Points>(null)
  const particleCount = 300
  
  // Create particles with different colors based on battle intensity
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return pos
  })

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Red for player attacks, blue for opponent attacks, yellow for neutral
      const intensity = props.battleIntensity
      if (intensity > 0.8) {
        // High intensity - explosive red/orange
        cols[i * 3] = 1
        cols[i * 3 + 1] = Math.random() * 0.3
        cols[i * 3 + 2] = Math.random() * 0.2
      } else if (intensity > 0.6) {
        // Medium-high intensity - orange/yellow
        cols[i * 3] = 1
        cols[i * 3 + 1] = Math.random() * 0.6 + 0.4
        cols[i * 3 + 2] = Math.random() * 0.2
      } else if (intensity > 0.4) {
        // Medium intensity - blue/purple
        cols[i * 3] = Math.random() * 0.4
        cols[i * 3 + 1] = Math.random() * 0.2
        cols[i * 3 + 2] = Math.random() * 0.8 + 0.2
      } else if (intensity > 0.2) {
        // Low-medium intensity - green/cyan
        cols[i * 3] = Math.random() * 0.2
        cols[i * 3 + 1] = Math.random() * 0.8 + 0.2
        cols[i * 3 + 2] = Math.random() * 0.6 + 0.4
      } else {
        // Low intensity - white/yellow
        cols[i * 3] = Math.random() * 0.3 + 0.7
        cols[i * 3 + 1] = Math.random() * 0.3 + 0.7
        cols[i * 3 + 2] = Math.random() * 0.3 + 0.4
      }
    }
    return cols
  }, [props.battleIntensity])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.15 * props.battleIntensity
      ref.current.rotation.y += delta * 0.1 * props.battleIntensity
      ref.current.rotation.z += delta * 0.05 * props.battleIntensity
      
      // Animate particles based on battle intensity
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      const colors = ref.current.geometry.attributes.color.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // More dynamic particle movement
        positions[i3] += (Math.random() - 0.5) * delta * props.battleIntensity * 2
        positions[i3 + 1] += (Math.random() - 0.5) * delta * props.battleIntensity * 2
        positions[i3 + 2] += (Math.random() - 0.5) * delta * props.battleIntensity * 2
        
        // Pulsing effect for colors
        const pulse = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1
        colors[i3] = Math.min(1, Math.max(0, colors[i3] + pulse * props.battleIntensity))
        colors[i3 + 1] = Math.min(1, Math.max(0, colors[i3 + 1] + pulse * props.battleIntensity))
        colors[i3 + 2] = Math.min(1, Math.max(0, colors[i3 + 2] + pulse * props.battleIntensity))
        
        // Keep particles within bounds with more dynamic boundaries
        const bounds = 8 + props.battleIntensity * 5
        if (Math.abs(positions[i3]) > bounds) positions[i3] *= 0.8
        if (Math.abs(positions[i3 + 1]) > bounds) positions[i3 + 1] *= 0.8
        if (Math.abs(positions[i3 + 2]) > bounds) positions[i3 + 2] *= 0.8
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      ref.current.geometry.attributes.color.needsUpdate = true
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
  const orbsRef = useRef<THREE.Mesh[]>([])
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3 * props.energyLevel
      ref.current.rotation.x += delta * 0.15 * props.energyLevel
      ref.current.rotation.z += delta * 0.05 * props.energyLevel
    }
    
    // Animate individual orbs
    orbsRef.current.forEach((orb, i) => {
      if (orb) {
        // Pulsing scale based on energy level
        const pulse = Math.sin(state.clock.elapsedTime * 3 + i) * 0.2 * props.energyLevel
        orb.scale.setScalar(0.1 + props.energyLevel * 0.3 + pulse)
        
        // Color shifting
        const material = orb.material as THREE.MeshBasicMaterial
        if (material) {
          const hue = (state.clock.elapsedTime * 0.1 + i * 0.2) % 1
          material.color.setHSL(hue, 0.8, 0.6)
        }
      }
    })
  })

  return (
    <group ref={ref}>
      {[...Array(12)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) orbsRef.current[i] = el }}
          position={[
            Math.sin(i * Math.PI / 6) * (3 + props.energyLevel * 2),
            Math.cos(i * Math.PI / 6) * (2 + props.energyLevel),
            Math.sin(i * Math.PI / 6) * Math.cos(i * Math.PI / 6) * (1 + props.energyLevel)
          ]}
          scale={0.1 + props.energyLevel * 0.3}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#ff6b6b' : i % 3 === 1 ? '#4ecdc4' : '#ffd93d'}
            transparent
            opacity={0.6 + props.energyLevel * 0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function CardAttackEffect({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const particleCount = 200
  
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = position[0]
      pos[i * 3 + 1] = position[1]
      pos[i * 3 + 2] = position[2]
    }
    return pos
  })

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Yellow/gold burst colors
      cols[i * 3] = 1
      cols[i * 3 + 1] = Math.random() * 0.8 + 0.2
      cols[i * 3 + 2] = Math.random() * 0.2
    }
    return cols
  }, [])

  useFrame((state, delta) => {
    if (ref.current && isActive) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      const colors = ref.current.geometry.attributes.color.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Radiate outward from the position
        const directionX = (Math.random() - 0.5) * 2
        const directionY = (Math.random() - 0.5) * 2
        const directionZ = (Math.random() - 0.5) * 2
        
        positions[i3] += directionX * delta * 5
        positions[i3 + 1] += directionY * delta * 5
        positions[i3 + 2] += directionZ * delta * 5
        
        // Fade out colors over time
        if (colors[i3] > 0) colors[i3] -= delta * 0.5
        if (colors[i3 + 1] > 0) colors[i3 + 1] -= delta * 0.3
        if (colors[i3 + 2] > 0) colors[i3 + 2] -= delta * 0.1
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true
      ref.current.geometry.attributes.color.needsUpdate = true
    }
  })

  if (!isActive) return null

  return (
    <Points ref={ref} positions={positions} colors={colors} frustumCulled={false}>
      <PointMaterial
        transparent
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        opacity={0.8}
      />
    </Points>
  )
}

function CardDestructionEffect({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const particleCount = 300
  
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.5
      pos[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 0.5
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.5
    }
    return pos
  })

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Red/orange explosion colors
      cols[i * 3] = Math.random() * 0.5 + 0.5
      cols[i * 3 + 1] = Math.random() * 0.3
      cols[i * 3 + 2] = Math.random() * 0.2
    }
    return cols
  }, [])

  useFrame((state, delta) => {
    if (ref.current && isActive) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array
      const colors = ref.current.geometry.attributes.color.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Explode outward with gravity effect
        const directionX = (Math.random() - 0.5) * 3
        const directionY = (Math.random() - 0.5) * 3
        const directionZ = (Math.random() - 0.5) * 3
        
        positions[i3] += directionX * delta * 3
        positions[i3 + 1] += directionY * delta * 3 - delta * 2 // Gravity pull downward
        positions[i3 + 2] += directionZ * delta * 3
        
        // Fade out colors over time
        if (colors[i3] > 0) colors[i3] -= delta * 0.3
        if (colors[i3 + 1] > 0) colors[i3 + 1] -= delta * 0.2
        if (colors[i3 + 2] > 0) colors[i3 + 2] -= delta * 0.1
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true
      ref.current.geometry.attributes.color.needsUpdate = true
    }
  })

  if (!isActive) return null

  return (
    <Points ref={ref} positions={positions} colors={colors} frustumCulled={false}>
      <PointMaterial
        transparent
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        opacity={0.9}
      />
    </Points>
  )
}

export default function GameWebGL({ 
  battleIntensity = 0, 
  energyLevel = 0,
  cardAttackEffect,
  cardDestructionEffect
}: { 
  battleIntensity?: number; 
  energyLevel?: number;
  cardAttackEffect?: { position: [number, number, number]; isActive: boolean };
  cardDestructionEffect?: { position: [number, number, number]; isActive: boolean };
}) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <BattleParticles battleIntensity={battleIntensity} />
        <EnergyOrbs energyLevel={energyLevel} />
        {cardAttackEffect && (
          <CardAttackEffect 
            position={cardAttackEffect.position} 
            isActive={cardAttackEffect.isActive} 
          />
        )}
        {cardDestructionEffect && (
          <CardDestructionEffect 
            position={cardDestructionEffect.position} 
            isActive={cardDestructionEffect.isActive} 
          />
        )}
      </Canvas>
    </div>
  )
}