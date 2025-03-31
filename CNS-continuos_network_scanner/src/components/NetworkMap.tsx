import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle } from 'lucide-react';

interface Port {
  port: number;
  state: string;
  service: string;
  version: string;
  product: string;
}

interface Device {
  ip: string;
  hostname: string;
  os: {
    name: string;
    accuracy: number;
    family: string;
  };
  ports: Port[];
  status: string;
  last_seen: number;
}

interface NetworkData {
  devices: Device[];
  metrics: {
    cpu_usage: number;
    memory_total: number;
    memory_used: number;
    memory_free: number;
  };
  timestamp: number;
}

interface NetworkMapProps {
  networkData: NetworkData | null;
}

function calculateNodePosition(index: number, total: number, radius: number = 3): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return [x, y, 0];
}

function Node({ device, position }: { device: Device; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'compromised': return '#ff0033';
      case 'warning': return '#f59e0b';
      default: return '#00f7ff';
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={getNodeColor(device.status)}
          emissive={getNodeColor(device.status)}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </mesh>

      {/* Port rings */}
      {device.ports.map((port, index) => (
        <PortRing
          key={port.port}
          port={port.port}
          index={index}
          total={device.ports.length}
          radius={0.6}
        />
      ))}

      {/* IP address */}
      <Html position={[0, -0.8, 0]} center>
        <div className="text-[#00f7ff] text-xs whitespace-nowrap bg-[#111111]/80 px-2 py-1 rounded">
          {device.ip}
        </div>
      </Html>

      {/* Hover details */}
      {hovered && (
        <Html position={[0, 0.8, 0]}>
          <div className="bg-[#111111] border border-[#00f7ff] p-2 rounded text-xs text-[#00f7ff] whitespace-nowrap">
            <div>{device.hostname}</div>
            <div>OS: {device.os.name}</div>
            <div>Ports: {device.ports.map(p => p.port).join(', ')}</div>
            <div className={`capitalize ${device.status === 'compromised' ? 'text-[#ff0033]' : ''}`}>
              Status: {device.status}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function PortRing({ port, index, total, radius = 0.5 }) {
  const ref = useRef();
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.01;
      ref.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[x, y, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshStandardMaterial
          color="#00f7ff"
          emissive="#00f7ff"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Html position={[0, 0, 0]} center>
        <div className="text-[#00f7ff] text-[10px] whitespace-nowrap">
          :{port}
        </div>
      </Html>
    </group>
  );
}

function DataParticle({ start, end, color = "#00f7ff" }) {
  const ref = useRef();
  const [progress, setProgress] = React.useState(Math.random());
  const speed = useMemo(() => 0.01 + Math.random() * 0.02, []);

  useFrame((state) => {
    setProgress((prev) => (prev >= 1 ? 0 : prev + speed));
    
    if (ref.current) {
      const x = THREE.MathUtils.lerp(start[0], end[0], progress);
      const y = THREE.MathUtils.lerp(start[1], end[1], progress);
      const z = THREE.MathUtils.lerp(start[2], end[2], progress);
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function Connections({ devices }: { devices: Device[] }) {
  const router: [number, number, number] = [0, 0, 0];
  
  return (
    <>
      {devices.map((device, i) => {
        const position = calculateNodePosition(i, devices.length);
        return (
          <React.Fragment key={device.ip}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([...router, ...position])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00f7ff" opacity={0.3} transparent />
            </line>
            {[0, 1, 2].map((j) => (
              <DataParticle
                key={`particle-${device.ip}-${j}`}
                start={router}
                end={position}
                color={device.status === 'compromised' ? '#ff0033' : '#00f7ff'}
              />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}

function Scene({ networkData }: { networkData: NetworkData | null }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = 7;
  }, [camera]);

  if (!networkData?.devices) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Router node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      <Connections devices={networkData.devices} />
      
      {networkData.devices.map((device, i) => (
        <Node
          key={device.ip}
          device={device}
          position={calculateNodePosition(i, networkData.devices.length)}
        />
      ))}
      
      <OrbitControls enableZoom={false} />
    </>
  );
}

export function NetworkMap({ networkData }: NetworkMapProps) {
  const hasCompromisedDevices = networkData?.devices.some(d => d.status === 'compromised');

  return (
    <div className="cyber-panel h-[600px] relative grid-bg">
      <Canvas>
        <Scene networkData={networkData} />
      </Canvas>
      
      {hasCompromisedDevices && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 text-[#ff0033]">
          <AlertTriangle className="h-5 w-5" />
          <span>THREAT DETECTED</span>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00ff00]"></div>
            <span>Router</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00f7ff]"></div>
            <span>Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff0033]"></div>
            <span>Compromised</span>
          </div>
        </div>
      </div>
    </div>
  );
}