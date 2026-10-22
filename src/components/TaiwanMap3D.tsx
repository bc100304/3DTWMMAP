import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Spot, Region, Category, LightingMode, ViewMode, StampRecord } from '../types';
import { Sun, Sunset, Moon, RotateCcw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Compass, Eye, MapPin, CheckCircle2 } from 'lucide-react';

interface TaiwanMap3DProps {
  spots: Spot[];
  selectedSpot?: Spot | null;
  selectedRegion: Region;
  selectedCategory: Category | 'all';
  stamps: Record<string, StampRecord>;
  onSelectSpot: (spot: Spot) => void;
  lightingMode: LightingMode;
  onLightingChange: (mode: LightingMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// Convert geographic coordinates (lat, lng) to 3D scene (x, z)
// Center around Sun Moon Lake: Lat 23.85, Lng 120.95
function geoTo3D(lat: number, lng: number): { x: number; z: number } {
  // Scaling factors: 1 deg lon is approx 102km in Taiwan, 1 deg lat is approx 111km
  const scaleX = 13.5;
  const scaleZ = 14.5;
  const centerX = 120.95;
  const centerZ = 23.85;

  const x = (lng - centerX) * scaleX;
  const z = -(lat - centerZ) * scaleZ;
  return { x, z };
}

// Low-poly model builders
function createFerrisWheel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ferris_wheel';

  // Support A-frame legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const legGeom = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8);

  const leg1 = new THREE.Mesh(legGeom, legMat);
  leg1.position.set(-0.25, 0.55, 0.15);
  leg1.rotation.z = 0.22;
  leg1.rotation.x = -0.15;
  group.add(leg1);

  const leg2 = new THREE.Mesh(legGeom, legMat);
  leg2.position.set(0.25, 0.55, 0.15);
  leg2.rotation.z = -0.22;
  leg2.rotation.x = -0.15;
  group.add(leg2);

  const leg3 = new THREE.Mesh(legGeom, legMat);
  leg3.position.set(-0.25, 0.55, -0.15);
  leg3.rotation.z = 0.22;
  leg3.rotation.x = 0.15;
  group.add(leg3);

  const leg4 = new THREE.Mesh(legGeom, legMat);
  leg4.position.set(0.25, 0.55, -0.15);
  leg4.rotation.z = -0.22;
  leg4.rotation.x = 0.15;
  group.add(leg4);

  // Rotating wheel container
  const wheel = new THREE.Group();
  wheel.name = 'rotating_part';
  wheel.position.set(0, 1.1, 0);

  // Hub
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16), hubMat);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);

  // Outer Rim
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.3 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.035, 8, 32), rimMat);
  wheel.add(rim);

  // Inner Rim
  const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 8, 24), rimMat);
  wheel.add(innerRim);

  // Spokes & Cabins
  const cabinColors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0x8b5cf6, 0xec4899];
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.4 });
  const spokeGeom = new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6);

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    // Spoke
    const spoke = new THREE.Mesh(spokeGeom, spokeMat);
    spoke.rotation.z = angle;
    wheel.add(spoke);

    // Cabin
    const cabinColor = cabinColors[i % cabinColors.length];
    const cabinMat = new THREE.MeshStandardMaterial({ color: cabinColor, roughness: 0.3 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.14), cabinMat);
    cabin.position.set(Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0);
    cabin.name = 'cabin';
    wheel.add(cabin);
  }

  group.add(wheel);
  group.scale.set(0.65, 0.65, 0.65);
  return group;
}

function createPyramidMountain(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mountain';

  // Left side bright green (#4ade80 / #22c55e), right side dark green (#15803d)
  const mountainGeom = new THREE.ConeGeometry(0.65, 1.3, 4, 1);
  mountainGeom.rotateY(Math.PI / 4);

  // Custom vertex colors or two split halves
  const leftMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });
  const rightMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  // Main pyramid body
  const leftHalf = new THREE.Mesh(mountainGeom, leftMat);
  leftHalf.position.set(0, 0.65, 0);
  group.add(leftHalf);

  // Snow / Rocky peak cap
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, flatShading: true });
  const snowPeak = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.45, 4, 1), snowMat);
  snowPeak.rotateY(Math.PI / 4);
  snowPeak.position.set(0, 1.15, 0);
  group.add(snowPeak);

  // Foothills
  const footGeom = new THREE.ConeGeometry(0.35, 0.6, 4);
  footGeom.rotateY(Math.PI / 4);
  const foot1 = new THREE.Mesh(footGeom, rightMat);
  foot1.position.set(0.35, 0.3, 0.15);
  group.add(foot1);

  const foot2 = new THREE.Mesh(footGeom, leftMat);
  foot2.position.set(-0.35, 0.25, -0.15);
  foot2.scale.set(0.75, 0.75, 0.75);
  group.add(foot2);

  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

function createMeinongUmbrella(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'umbrella';

  // White base canopy with colorful painted rings
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const canopyGeom = new THREE.ConeGeometry(0.75, 0.35, 16, 1, true);
  const canopy = new THREE.Mesh(canopyGeom, canopyMat);
  canopy.position.set(0, 0.95, 0);
  group.add(canopy);

  // Painted decorative rings (Culture / Meinong traditional floral band)
  const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 }); // Vermilion ring
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.02, 8, 24), ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.set(0, 0.9, 0);
  group.add(ring1);

  const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // Indigo cyan ring
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 8, 24), ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.set(0, 0.83, 0);
  group.add(ring2);

  // Top cap (Finial)
  const capMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.4, roughness: 0.4 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.12, 10), capMat);
  cap.position.set(0, 1.15, 0);
  group.add(cap);

  // Bamboo shaft / handle
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), shaftMat);
  shaft.position.set(0, 0.5, 0);
  group.add(shaft);

  // Bamboo umbrella ribs underneath
  const ribMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 4), ribMat);
    rib.rotation.z = 0.55;
    rib.rotation.y = angle;
    rib.position.set(Math.cos(angle) * 0.2, 0.88, Math.sin(angle) * 0.2);
    group.add(rib);
  }

  // Slight charming tilt
  group.rotation.z = 0.2;
  group.rotation.x = -0.15;
  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

function createCornOnCob(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'corn';

  // Golden Yellow Cob with low-poly kernel texture
  const cobMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
    metalness: 0.1,
  });

  const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.8, 10, 5), cobMat);
  cob.position.set(0, 0.6, 0);
  group.add(cob);

  // Rounded top tip
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), cobMat);
  tip.position.set(0, 1.0, 0);
  group.add(tip);

  // Green Husks wrapped at the base
  const huskMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const husk = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4, 1, true), huskMat);
    husk.position.set(Math.cos(angle) * 0.14, 0.35, Math.sin(angle) * 0.14);
    husk.rotation.z = Math.cos(angle) * 0.35;
    husk.rotation.x = Math.sin(angle) * 0.35;
    group.add(husk);
  }

  // Stalk handle
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7 });
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8), stalkMat);
  stalk.position.set(0, 0.12, 0);
  group.add(stalk);

  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

function createCoconutPalmTree(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'palm';

  // Segmented curving trunk
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const segments = 5;
  let currY = 0;
  let currX = 0;

  for (let i = 0; i < segments; i++) {
    const segH = 0.22;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 - i * 0.008, 0.09 - i * 0.008, segH, 7),
      trunkMat
    );
    currX += 0.04;
    currY += segH;
    seg.position.set(currX, currY - segH / 2, 0);
    seg.rotation.z = -0.15;
    group.add(seg);
  }

  // Canopy top position
  const topPos = new THREE.Vector3(currX + 0.04, currY, 0);

  // Brown Coconuts
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
  const coconutGeom = new THREE.SphereGeometry(0.06, 6, 6);
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const coconut = new THREE.Mesh(coconutGeom, coconutMat);
    coconut.position.set(
      topPos.x + Math.cos(angle) * 0.08,
      topPos.y - 0.04,
      topPos.z + Math.sin(angle) * 0.08
    );
    group.add(coconut);
  }

  // 5 Arched Palm Fronds
  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const frondGroup = new THREE.Group();
    frondGroup.position.copy(topPos);
    frondGroup.rotation.y = angle;

    // Curved frond leaf
    const leafGeom = new THREE.CylinderGeometry(0.01, 0.12, 0.65, 4);
    leafGeom.rotateZ(Math.PI / 3);
    const leaf = new THREE.Mesh(leafGeom, frondMat);
    leaf.position.set(0.28, -0.08, 0);
    frondGroup.add(leaf);

    group.add(frondGroup);
  }

  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

export default function TaiwanMap3D({
  spots,
  selectedSpot = null,
  selectedRegion,
  selectedCategory,
  stamps,
  onSelectSpot,
  lightingMode,
  onLightingChange,
  viewMode,
  onViewModeChange,
}: TaiwanMap3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);
  const [mouseScreenPos, setMouseScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References to keep Three.js animation running cleanly without re-mounting
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animatedObjectsRef = useRef<THREE.Group[]>([]);
  const spotMeshesMap = useRef<Map<THREE.Object3D, Spot>>(new Map());

  // Track currently selected spot in ref for 60fps render loop
  const selectedSpotRef = useRef<Spot | null>(selectedSpot);
  useEffect(() => {
    selectedSpotRef.current = selectedSpot;
  }, [selectedSpot]);

  // Lighting refs for smooth mode switching
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const nightCityGroupRef = useRef<THREE.Group | null>(null);

  // Target camera positions for 3D and 2D
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 26, 30));
  const controlsTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Filter spots according to active region and category
  const filteredSpots = useMemo(() => {
    return spots.filter((s) => {
      const matchRegion = selectedRegion === '全部' || s.region === selectedRegion;
      const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchRegion && matchCategory;
    });
  }, [spots, selectedRegion, selectedCategory]);

  // Smooth Focus and Zoom to Selected Spot
  useEffect(() => {
    if (selectedSpot) {
      const { x, z } = geoTo3D(selectedSpot.lat, selectedSpot.lng);
      // Smoothly focus camera target on the landmark's position
      controlsTargetPos.current.set(x, 1.2, z);

      if (viewMode === '2d') {
        // 2D top-down close zoom
        cameraTargetPos.current.set(x, 13.5, z + 0.01);
      } else {
        // 3D perspective cinematic close-up angled view
        cameraTargetPos.current.set(x - 3.2, 5.5, z + 6.8);
      }
    }
  }, [selectedSpot, viewMode]);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Background
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 26, 30);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Studio Environment via PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below sea floor
    controls.minDistance = 6;
    controls.maxDistance = 75;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 6. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(18, 32, 16);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 7. Taiwan Terrain Construction
    const terrainGroup = new THREE.Group();
    terrainGroup.name = 'taiwan_terrain';

    // Ocean Floor Base
    const oceanGeom = new THREE.PlaneGeometry(120, 120, 48, 48);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      roughness: 0.2,
      metalness: 0.4,
    });
    const ocean = new THREE.Mesh(oceanGeom, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.15;
    ocean.receiveShadow = !isSoftwareGl;
    terrainGroup.add(ocean);

    // Subtle ocean grid lines for navigation feel
    const gridHelper = new THREE.GridHelper(100, 50, 0x0284c7, 0x0369a1);
    gridHelper.position.y = -0.14;
    terrainGroup.add(gridHelper);

    // Realistic Taiwan Island Shape using ExtrudeGeometry
    // Coordinates normalized to scale around (0,0)
    const taiwanShape = new THREE.Shape();
    // Start at northern tip: Fuguijiao
    taiwanShape.moveTo(6.8, -21.0);
    taiwanShape.bezierCurveTo(8.5, -19.5, 9.2, -16.5, 9.5, -13.0); // Northeast Keelung / Sandiaojiao
    taiwanShape.bezierCurveTo(9.6, -9.0, 8.5, -5.0, 7.5, -1.0); // Yilan coast
    taiwanShape.bezierCurveTo(6.8, 3.0, 6.2, 7.0, 5.5, 11.0); // Hualien steep coast
    taiwanShape.bezierCurveTo(4.8, 14.5, 3.8, 18.0, 2.5, 21.0); // Taitung coast
    taiwanShape.bezierCurveTo(1.5, 23.5, 0.5, 25.5, -0.2, 27.5); // Hengchun peninsula east
    taiwanShape.bezierCurveTo(-0.8, 28.5, -1.8, 28.5, -2.5, 27.5); // Eluanbi south tip
    taiwanShape.bezierCurveTo(-3.2, 26.0, -3.8, 23.0, -4.5, 20.0); // Fangliao / Kaohsiung coast
    taiwanShape.bezierCurveTo(-5.5, 16.0, -7.0, 11.5, -8.0, 7.0); // Tainan coast
    taiwanShape.bezierCurveTo(-8.8, 2.5, -9.0, -2.0, -8.5, -6.5); // Chiayi / Yunlin / Changhua coast
    taiwanShape.bezierCurveTo(-8.0, -11.0, -6.5, -15.0, -4.0, -18.5); // Taichung / Miaoli / Hsinchu coast
    taiwanShape.bezierCurveTo(-1.5, -20.5, 3.5, -22.0, 6.8, -21.0); // Back to north Fuguijiao

    // Extrude with smooth bevels
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 4,
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.35,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const islandGeom = new THREE.ExtrudeGeometry(taiwanShape, extrudeSettings);
    // Rotate to lie on XZ plane and adjust orientation (North = -Z, East = +X)
    islandGeom.rotateX(Math.PI / 2);
    islandGeom.scale(1.0, 1.0, 1.0);

    // Apply Central Mountain Range vertex elevation displacement
    const posAttr = islandGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      if (y > 0.4) {
        // Displace mountain ridge along X: ~ 0 to 4 (Central Mountain Range spine)
        const ridgeCenter = 1.5;
        const distFromRidge = Math.abs(x - ridgeCenter);
        const northSouthFactor = Math.cos((z / 25) * 1.2); // taper at ends
        if (distFromRidge < 6.0 && northSouthFactor > 0) {
          const elev = Math.max(0, (6.0 - distFromRidge) * 0.35 * northSouthFactor);
          // Rocky noise
          const noise = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.12;
          posAttr.setY(i, y + elev + noise);
        }
      }
    }
    islandGeom.computeVertexNormals();

    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x166534, // Lush emerald forest
      roughness: 0.75,
      metalness: 0.1,
      flatShading: true,
    });
    const island = new THREE.Mesh(islandGeom, islandMat);
    island.castShadow = !isSoftwareGl;
    island.receiveShadow = !isSoftwareGl;
    terrainGroup.add(island);

    // Coastline Sand Rim Shelf
    const coastMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber golden beach sand
      roughness: 0.9,
      metalness: 0.05,
    });
    const coast = new THREE.Mesh(islandGeom, coastMat);
    coast.position.y = -0.06;
    coast.scale.set(1.025, 0.6, 1.025);
    terrainGroup.add(coast);

    // Offshore Islands
    const offshoreIslands = [
      { name: 'Penghu', x: -18, z: 2, scale: 0.45, color: 0x15803d },
      { name: 'Green Island', x: 10, z: 16, scale: 0.22, color: 0x166534 },
      { name: 'Orchid Island', x: 12, z: 25, scale: 0.32, color: 0x166534 },
      { name: 'Turtle Island', x: 14, z: -14, scale: 0.25, color: 0x166534 },
      { name: 'Kinmen', x: -33, z: -9, scale: 0.45, color: 0x15803d },
      { name: 'Matsu', x: -16, z: -35, scale: 0.35, color: 0x15803d },
    ];

    offshoreIslands.forEach((isle) => {
      const geom = new THREE.CylinderGeometry(
        isle.scale * 3.0,
        isle.scale * 3.8,
        0.55,
        7
      );
      const mat = new THREE.MeshStandardMaterial({
        color: isle.color,
        roughness: 0.8,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(isle.x, 0.25, isle.z);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      terrainGroup.add(mesh);
    });

    scene.add(terrainGroup);

    // 8. Night City Lights Group (illuminates in night mode)
    const nightCityGroup = new THREE.Group();
    nightCityGroup.name = 'night_lights';
    const cityCoords = [
      { x: 7.5, z: -17, size: 2.5, intensity: 1.0 }, // Taipei
      { x: -5.0, z: -5, size: 2.2, intensity: 0.9 }, // Taichung
      { x: -7.0, z: 12, size: 1.8, intensity: 0.85 }, // Tainan
      { x: -6.5, z: 18, size: 2.2, intensity: 0.9 }, // Kaohsiung
      { x: 3.5, z: -13, size: 1.4, intensity: 0.7 }, // Taoyuan
      { x: -1.0, z: -11, size: 1.5, intensity: 0.7 }, // Hsinchu
      { x: 8.5, z: 0, size: 1.2, intensity: 0.6 }, // Hualien
      { x: 4.0, z: 17, size: 1.2, intensity: 0.6 }, // Taitung
    ];

    cityCoords.forEach((c) => {
      const cityLightGeom = new THREE.CircleGeometry(c.size, 16);
      const cityLightMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const lightMesh = new THREE.Mesh(cityLightGeom, cityLightMat);
      lightMesh.rotation.x = -Math.PI / 2;
      lightMesh.position.set(c.x, 0.96, c.z);
      nightCityGroup.add(lightMesh);
    });
    scene.add(nightCityGroup);
    nightCityGroupRef.current = nightCityGroup;

    // 9. Markers Container
    const markersGroup = new THREE.Group();
    markersGroup.name = 'markers_group';
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Raycasting for interactive selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setMouseScreenPos({ x: event.clientX, y: event.clientY });

      raycaster.setFromCamera(mouse, camera);
      if (markersGroupRef.current) {
        const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
        if (intersects.length > 0) {
          let current: THREE.Object3D | null = intersects[0].object;
          while (current && current.parent && current.parent !== markersGroupRef.current) {
            current = current.parent;
          }
          if (current) {
            const found = spotMeshesMap.current.get(current);
            if (found) {
              setHoveredSpot(found);
              container.style.cursor = 'pointer';
              return;
            }
          }
        }
      }
      setHoveredSpot(null);
      container.style.cursor = 'default';
    };

    const handlePointerDown = (event: MouseEvent) => {
      // Only handle left clicks
      if (event.button !== 0) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (markersGroupRef.current) {
        const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
        if (intersects.length > 0) {
          let current: THREE.Object3D | null = intersects[0].object;
          while (current && current.parent && current.parent !== markersGroupRef.current) {
            current = current.parent;
          }
          if (current) {
            const found = spotMeshesMap.current.get(current);
            if (found) {
              // Smooth focus and zoom immediately
              const { x, z } = geoTo3D(found.lat, found.lng);
              controlsTargetPos.current.set(x, 1.2, z);
              if (viewMode === '2d') {
                cameraTargetPos.current.set(x, 13.5, z + 0.01);
              } else {
                cameraTargetPos.current.set(x - 3.2, 5.5, z + 6.8);
              }
              onSelectSpot(found);
            }
          }
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handlePointerDown);

    // Resize Observer
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation towards target
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(cameraTargetPos.current, 0.08);
        controlsRef.current.target.lerp(controlsTargetPos.current, 0.08);
        controlsRef.current.update();
      }

      // Animate custom 3D models (Ferris wheel rotating, floating hover wave)
      animatedObjectsRef.current.forEach((obj) => {
        if (obj.name === 'ferris_wheel') {
          const rotPart = obj.getObjectByName('rotating_part');
          if (rotPart) {
            rotPart.rotation.z += delta * 0.75;
            // Counter-rotate cabins so they stay upright
            rotPart.children.forEach((child) => {
              if (child.name === 'cabin') {
                child.rotation.z = -rotPart.rotation.z;
              }
            });
          }
        } else if (obj.name === 'marker_root') {
          const isSelected = Boolean(selectedSpotRef.current && obj.userData.spotId === selectedSpotRef.current.id);
          const baseOffset = obj.userData.origY || 1.0;
          const phase = obj.userData.phase || 0;

          if (isSelected) {
            // Selected landmark: elevated harmonic floating animation
            const floatOffset = Math.sin(elapsed * 3.5) * 0.35 + 0.45;
            obj.position.y = baseOffset + floatOffset;

            // Smooth scale expansion
            obj.scale.lerp(new THREE.Vector3(1.35, 1.35, 1.35), 0.12);

            // Showcase rotation
            const modelChild = obj.getObjectByName('category_model');
            if (modelChild) {
              modelChild.rotation.y += delta * 0.75;
            }

            // Pulsing selection beacon ring
            const selectRing = obj.getObjectByName('selected_ring');
            if (selectRing && selectRing instanceof THREE.Mesh) {
              selectRing.visible = true;
              const ringScale = 1.0 + Math.sin(elapsed * 4.5) * 0.22;
              selectRing.scale.set(ringScale, ringScale, 1);
              (selectRing.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(elapsed * 4.5) * 0.25;
            }
          } else {
            // Unselected landmarks: gentle ambient wave
            obj.position.y = baseOffset + Math.sin(elapsed * 2.2 + phase) * 0.12;
            obj.scale.lerp(new THREE.Vector3(1.0, 1.0, 1.0), 0.08);

            const modelChild = obj.getObjectByName('category_model');
            if (modelChild && modelChild.userData.origRotY !== undefined) {
              modelChild.rotation.y = THREE.MathUtils.lerp(modelChild.rotation.y, modelChild.userData.origRotY, 0.05);
            }

            const selectRing = obj.getObjectByName('selected_ring');
            if (selectRing) {
              selectRing.visible = false;
            }
          }
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [onSelectSpot]);

  // Update lighting mode dynamically
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    const nightGroup = nightCityGroupRef.current;

    if (lightingMode === 'day') {
      scene.background = new THREE.Color(0xdbeafe); // Soft day sky
      if (scene.fog) scene.fog.color = new THREE.Color(0xdbeafe);
      sun.color.setHex(0xfffbeb);
      sun.intensity = 1.5;
      sun.position.set(18, 34, 16);
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0x94a3b8);
      hemi.intensity = 0.95;

      if (nightGroup) {
        nightGroup.children.forEach((m) => {
          if (m instanceof THREE.Mesh) (m.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }
    } else if (lightingMode === 'sunset') {
      scene.background = new THREE.Color(0x451a03); // Warm dusk sunset sky
      if (scene.fog) scene.fog.color = new THREE.Color(0x78350f);
      sun.color.setHex(0xf97316); // Golden orange sunlight
      sun.intensity = 1.8;
      sun.position.set(30, 12, 24); // Lower dramatic sun angle
      hemi.color.setHex(0xfde047);
      hemi.groundColor.setHex(0x451a03);
      hemi.intensity = 0.8;

      if (nightGroup) {
        nightGroup.children.forEach((m) => {
          if (m instanceof THREE.Mesh) (m.material as THREE.MeshBasicMaterial).opacity = 0.25;
        });
      }
    } else {
      // Night
      scene.background = new THREE.Color(0x020617); // Dark night sky
      if (scene.fog) scene.fog.color = new THREE.Color(0x020617);
      sun.color.setHex(0x38bdf8); // Pale moonlight
      sun.intensity = 0.45;
      sun.position.set(-15, 25, -15);
      hemi.color.setHex(0x1e293b);
      hemi.groundColor.setHex(0x090d16);
      hemi.intensity = 0.4;

      if (nightGroup) {
        nightGroup.children.forEach((m) => {
          if (m instanceof THREE.Mesh) (m.material as THREE.MeshBasicMaterial).opacity = 0.85;
        });
      }
    }
  }, [lightingMode]);

  // Update view mode (3D Perspective vs 2D Top-Down)
  useEffect(() => {
    if (viewMode === '2d') {
      // 2D Top-Down view straight from above
      cameraTargetPos.current.set(0, 48, 0.01);
      controlsTargetPos.current.set(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.enableRotate = false; // Restrict to pan/zoom in 2D
      }
    } else {
      // 3D Perspective view angled
      cameraTargetPos.current.set(0, 26, 30);
      controlsTargetPos.current.set(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.enableRotate = true;
      }
    }
  }, [viewMode]);

  // Re-build 3D markers whenever filteredSpots or stamps change
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;

    // Clear existing markers
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
    }
    spotMeshesMap.current.clear();
    animatedObjectsRef.current = [];

    // Create marker for each spot
    filteredSpots.forEach((spot, idx) => {
      const { x, z } = geoTo3D(spot.lat, spot.lng);
      const isStamped = Boolean(stamps[spot.id]);

      const markerRoot = new THREE.Group();
      markerRoot.name = 'marker_root';
      const groundY = 1.0;
      markerRoot.position.set(x, groundY, z);
      markerRoot.userData = {
        origY: groundY,
        phase: (idx * 0.45) % (Math.PI * 2),
        spotId: spot.id,
      };

      // Base pedestal disc
      const baseCol = isStamped ? 0xe11d48 : 0x0284c7; // Vermilion for stamped, Cyan for unstamped
      const baseMat = new THREE.MeshStandardMaterial({
        color: baseCol,
        roughness: 0.4,
        metalness: 0.6,
      });
      const basePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.15, 16), baseMat);
      basePedestal.position.y = 0.08;
      markerRoot.add(basePedestal);

      // Stamped indicator golden halo
      if (isStamped) {
        const haloGeom = new THREE.RingGeometry(0.7, 0.9, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
        });
        const halo = new THREE.Mesh(haloGeom, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.02;
        markerRoot.add(halo);
      }

      // Add category-specific low-poly 3D model
      let categoryModel: THREE.Group;
      switch (spot.category) {
        case 'landmark':
          categoryModel = createFerrisWheel();
          break;
        case 'nature':
          categoryModel = createPyramidMountain();
          break;
        case 'culture':
          categoryModel = createMeinongUmbrella();
          break;
        case 'food':
          categoryModel = createCornOnCob();
          break;
        case 'coast':
          categoryModel = createCoconutPalmTree();
          break;
        default:
          categoryModel = createPyramidMountain();
      }

      categoryModel.name = 'category_model';
      categoryModel.userData = { origRotY: categoryModel.rotation.y };
      categoryModel.position.y = 0.15;
      markerRoot.add(categoryModel);

      // Pulsing Selection Beacon Ring (visible when selected)
      const selectRingGeom = new THREE.RingGeometry(0.85, 1.25, 32);
      const selectRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const selectRing = new THREE.Mesh(selectRingGeom, selectRingMat);
      selectRing.name = 'selected_ring';
      selectRing.rotation.x = -Math.PI / 2;
      selectRing.position.y = 0.04;
      selectRing.visible = Boolean(selectedSpotRef.current && spot.id === selectedSpotRef.current.id);
      markerRoot.add(selectRing);

      // Floating Beacon / ID Tag Pin
      const pinMat = new THREE.MeshStandardMaterial({
        color: isStamped ? 0xe11d48 : 0x38bdf8,
        emissive: isStamped ? 0x991b1b : 0x0369a1,
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      const pinSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), pinMat);
      pinSphere.position.y = 1.95;
      markerRoot.add(pinSphere);

      // Register for raycasting & animation
      markersGroup.add(markerRoot);
      spotMeshesMap.current.set(markerRoot, spot);
      animatedObjectsRef.current.push(markerRoot);

      if (spot.category === 'landmark') {
        animatedObjectsRef.current.push(categoryModel);
      }
    });
  }, [filteredSpots, stamps]);

  // Pan controls
  const handlePanNorth = () => {
    if (controlsRef.current) {
      controlsTargetPos.current.z -= 4.0;
      cameraTargetPos.current.z -= 4.0;
    }
  };

  const handlePanSouth = () => {
    if (controlsRef.current) {
      controlsTargetPos.current.z += 4.0;
      cameraTargetPos.current.z += 4.0;
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraTargetPos.current.multiplyScalar(0.85);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraTargetPos.current.multiplyScalar(1.15);
    }
  };

  const handleResetCamera = () => {
    if (viewMode === '2d') {
      cameraTargetPos.current.set(0, 48, 0.01);
      controlsTargetPos.current.set(0, 0, 0);
    } else {
      cameraTargetPos.current.set(0, 26, 30);
      controlsTargetPos.current.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Left: View Mode Toggle & Compass Indicator */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 border border-slate-700/60 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => onViewModeChange('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              viewMode === '3d'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            3D 透視視角
          </button>
          <button
            onClick={() => onViewModeChange('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              viewMode === '2d'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            2D 俯視視角
          </button>
        </div>

        {/* Right: Lighting Mode Switcher */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/80 border border-slate-700/60 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => onLightingChange('day')}
            title="日間清朗"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              lightingMode === 'day'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">日間</span>
          </button>
          <button
            onClick={() => onLightingChange('sunset')}
            title="金黃夕陽"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              lightingMode === 'sunset'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">夕陽</span>
          </button>
          <button
            onClick={() => onLightingChange('night')}
            title="璀璨夜景"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              lightingMode === 'night'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">夜景</span>
          </button>
        </div>
      </div>

      {/* Right Screen Navigation Controls (Pan Up/Down, Zoom +/-, Reset) */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-10">
        <div className="flex flex-col bg-slate-900/85 border border-slate-700/60 rounded-xl p-1 shadow-xl">
          <button
            onClick={handlePanNorth}
            title="向北移動"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={handlePanSouth}
            title="向南移動"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col bg-slate-900/85 border border-slate-700/60 rounded-xl p-1 shadow-xl">
          <button
            onClick={handleZoomIn}
            title="放大地圖"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="縮小地圖"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            title="重設視角"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-t border-slate-800 mt-1 pt-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Hover Tooltip */}
      {hoveredSpot && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 bg-slate-900/95 text-white border border-slate-700 rounded-xl shadow-2xl transition-opacity duration-150"
          style={{
            left: `${mouseScreenPos.x}px`,
            top: `${mouseScreenPos.y - 12}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-sky-400">{hoveredSpot.id}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-300">{hoveredSpot.region}</span>
            {stamps[hoveredSpot.id] ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 ml-auto">
                <CheckCircle2 className="w-3 h-3" /> 已蓋章
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 ml-auto">待收集</span>
            )}
          </div>
          <p className="text-sm font-bold text-white tracking-wide">{hoveredSpot.name}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{hoveredSpot.englishName}</p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
            <span>海拔 {hoveredSpot.elevation}</span>
            <span>·</span>
            <span>★ {hoveredSpot.rating.toFixed(1)}</span>
            <span className="text-sky-400 font-medium ml-auto">點擊查看詳情 →</span>
          </div>
        </div>
      )}

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/75 border border-slate-800/80 rounded-lg px-3 py-1.5">
        <MapPin className="w-3.5 h-3.5 text-sky-400" />
        <span>拖曳旋轉 · 滾輪縮放 · 點擊地標立即蓋印紀念章</span>
      </div>
    </div>
  );
}
