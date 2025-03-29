import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useDragControls } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle } from 'lucide-react';
import create from 'zustand';

interface NodeState {
  id: string | number;
  position: [number, number, number];
  ip: string;
  ports: number[];
  status: string;
}

interface NodeStore {
  nodes: NodeState[];
  updateNodePosition: (id: string | number, position: [number, number, number]) => void;
}

const useNodeStore = create<NodeStore>((set) => ({
  nodes: [
    { id: 'router', position: [0, 0, 0], ip: '192.168.1.1', ports: [80, 443, 53], status: 'safe' },
    { id: 1, position: [-2, 2, 0], ip: '192.168.1.100', ports: [22, 80, 443], status: 'compromised' },
    { id: 2, position: [2, 2, 0], ip: '192.168.1.150', ports: [21, 22, 80], status: 'warning' },
    { id: 3, position: [-2, -2, 0], ip: '192.168.1.200', ports: [3306, 5432], status: 'safe' },
    { id: 4, position: [2, -2, 0], ip: '192.168.1.250', ports: [80, 8080], status: 'safe' },
  ],
  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    })),
}));

function DraggableNode({ node }: { node: NodeState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const updateNodePosition = useNodeStore((state) => state.updateNodePosition);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'compromised': return '#ff0033';
      case 'warning': return '#f59e0b';
      default: return '#00f7ff';
    }
  };

  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  const handlePointerMove = (e: THREE.Event) => {
    if (isDragging && meshRef.current) {
      const { point } = e as unknown as { point: THREE.Vector3 };
      updateNodePosition(node.id, [point.x, point.y, 0]);
    }
  };

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={getNodeColor(node.status)}
          emissive={getNodeColor(node.status)}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </mesh>

      {/* Port rings */}
      {node.ports.map((port, index) => (
        <PortRing
          key={port}
          port={port}
          index={index}
          total={node.ports.length}
          radius={0.6}
        />
      ))}

      {/* IP address */}
      <Html position={[0, -0.8, 0]} center>
        <div className="text-[#00f7ff] text-xs whitespace-nowrap bg-[#111111]/80 px-2 py-1 rounded">
          {node.ip}
        </div>
      </Html>

      {/* Hover details */}
      {hovered && (
        <Html position={[0, 0.8, 0]}>
          <div className="bg-[#111111] border border-[#00f7ff] p-2 rounded text-xs text-[#00f7ff] whitespace-nowrap">
            <div>{node.id === 'router' ? 'Router' : 'Device'}</div>
            <div>Ports: {node.ports.join(', ')}</div>
            <div className={`capitalize ${node.status === 'compromised' ? 'text-[#ff0033]' : ''}`}>
              Status: {node.status}
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

function Connections() {
  const nodes = useNodeStore((state) => state.nodes);
  const router = nodes.find((node) => node.id === 'router');
  const devices = nodes.filter((node) => node.id !== 'router');
  
  return (
    <>
      {devices.map((node) => (
        <React.Fragment key={node.id}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...router!.position,
                  ...node.position,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f7ff" opacity={0.3} transparent />
          </line>
          {[0, 1, 2].map((i) => (
            <DataParticle
              key={`particle-${node.id}-${i}`}
              start={router!.position}
              end={node.position}
              color={node.status === 'compromised' ? '#ff0033' : '#00f7ff'}
            />
          ))}
        </React.Fragment>
      ))}
    </>
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

function Scene() {
  const { camera } = useThree();
  const nodes = useNodeStore((state) => state.nodes);
  
  useEffect(() => {
    camera.position.z = 7;
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Connections />
      {nodes.map((node) => (
        <DraggableNode key={node.id} node={node} />
      ))}
      <OrbitControls enableZoom={false} />
    </>
  );
}

export function NetworkMap() {
  return (
    <div className="cyber-panel h-[600px] relative grid-bg">
      <Canvas>
        <Scene />
      </Canvas>
      
      <div className="absolute top-4 right-4 flex items-center space-x-2 text-[#ff0033]">
        <AlertTriangle className="h-5 w-5" />
        <span>THREAT DETECTED</span>
      </div>
      
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