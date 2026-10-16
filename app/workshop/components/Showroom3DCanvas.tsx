"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { ColorPicker } from "antd";
import {
  Rotate3d,
  Palette,
  Car,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { InventoryItem } from "@/app/inventory/data/wheels";
import { buildEnkeiRPF1Mesh } from "@/app/workshop/utils/enkeiRPF1Builder";

export interface PaintOption {
  name: string;
  hex: string;
  finish: "Gloss" | "Matte" | "Metallic" | "Carbon";
}

export const PAINT_COLORS: PaintOption[] = [
  { name: "Chalk White", hex: "#f0f2f5", finish: "Gloss" },
  { name: "Guards Red", hex: "#d91e1e", finish: "Gloss" },
  { name: "Stealth Obsidian", hex: "#111317", finish: "Metallic" },
  { name: "Miami Blue", hex: "#00a3e0", finish: "Gloss" },
  { name: "Racing Yellow", hex: "#facc15", finish: "Gloss" },
  { name: "Ultra Violet", hex: "#6d28d9", finish: "Metallic" },
  { name: "Matte Gunmetal", hex: "#4b5563", finish: "Matte" },
  { name: "Python Green", hex: "#16a34a", finish: "Gloss" },
];

export interface CarModelPreset {
  id: "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91";
  name: string;
  brand: string;
  modelFile: string;
  power: string;
  torque: string;
  weight: string;
  drag: string;
  downforce: string;
  wheelBaseWidth?: number;
  wheelBaseLength?: number;
}

export const CAR_MODELS: CarModelPreset[] = [
  {
    id: "porsche-gt3rs",
    name: "Porsche 911 GT3 RS",
    brand: "PORSCHE MOTORSPORT",
    modelFile: "/911gt3rs.glb",
    power: "642 HP",
    torque: "590 LB-FT",
    weight: "3,120 LBS",
    drag: "0.31 CD",
    downforce: "+860 kg @ 285 km/h",
    wheelBaseWidth: 1.86,
    wheelBaseLength: 2.55,
  },
  {
    id: "bmw-m3-g81",
    name: "BMW M4 Competition",
    brand: "BMW M POWER",
    modelFile: "/m4.glb",
    power: "530 HP",
    torque: "650 NM",
    weight: "3,750 LBS",
    drag: "0.33 CD",
    downforce: "+320 kg @ 250 km/h",
    wheelBaseWidth: 1.88,
    wheelBaseLength: 2.75,
  },
  {
    id: "toyota-supra-a91",
    name: "Toyota GR86 Gazoo",
    brand: "GAZOO RACING",
    modelFile: "/gr86.glb",
    power: "382 HP",
    torque: "500 NM",
    weight: "3,395 LBS",
    drag: "0.29 CD",
    downforce: "+280 kg @ 240 km/h",
    wheelBaseWidth: 1.82,
    wheelBaseLength: 2.50,
  },
];

interface Showroom3DCanvasProps {
  equippedVelg: InventoryItem;
  equippedTyre: InventoryItem;
  equippedSpoiler: InventoryItem;
  equippedHood: InventoryItem;
  equippedBodykit: InventoryItem;
  equippedBrake: InventoryItem;
  customModelFile?: { file: File; type: "glb" | "gltf" | "fbx"; scale: number } | null;
  selectedCarModelId: "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91";
  onSelectCarModel: (id: "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91") => void;
  currentPaintColor?: PaintOption;
  onPaintColorChange?: (color: PaintOption) => void;
}

export default function Showroom3DCanvas({
  equippedVelg,
  equippedTyre,
  equippedBrake,
  customModelFile,
  selectedCarModelId,
  onSelectCarModel,
  currentPaintColor,
  onPaintColorChange,
}: Showroom3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalPaintColor, setInternalPaintColor] = useState<PaintOption>(PAINT_COLORS[0]);
  const paintColor = currentPaintColor || internalPaintColor;
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeCamPreset, setActiveCamPreset] = useState<string>("3/4 Front");
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  const handleHexChange = (newHex: string) => {
    const nextColor = {
      ...paintColor,
      name: "Custom Color",
      hex: newHex,
    };
    setInternalPaintColor(nextColor);
    onPaintColorChange?.(nextColor);
  };

  const handleFinishChange = (newFinish: "Gloss" | "Matte" | "Metallic" | "Carbon") => {
    const nextColor = {
      ...paintColor,
      finish: newFinish,
    };
    setInternalPaintColor(nextColor);
    onPaintColorChange?.(nextColor);
  };

  const currentCarData =
    CAR_MODELS.find((c) => c.id === selectedCarModelId) || CAR_MODELS[0];

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    carBodyMaterial: THREE.MeshPhysicalMaterial;
    carGroup: THREE.Group;
    bodyMeshGroup: THREE.Group;
    wheelsGroup: THREE.Group;
    spoilerGroup: THREE.Group;
    hoodGroup: THREE.Group;
    caliperGroup: THREE.Group;
    customModelGroup: THREE.Group;
    glbModelGroup: THREE.Group;
  } | null>(null);

  // Initialize Three.js Scene & Showroom Environment
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    scene.fog = new THREE.FogExp2(0x05060a, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.8, 2.2, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    container.replaceChildren(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.6, 0);

    // 4. ================= SHOWROOM STUDIO LIGHTING & STAGE =================
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    // Key Studio Light
    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(6, 9, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // Rim Studio Spotlights
    const rimLight1 = new THREE.PointLight(0x9cbbf8, 3.8, 16);
    rimLight1.position.set(-6, 3.5, -4);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x00e5ff, 2.8, 14);
    rimLight2.position.set(5, 2.5, -5);
    scene.add(rimLight2);

    const frontFillLight = new THREE.DirectionalLight(0xbdd5f8, 1.4);
    frontFillLight.position.set(-4, 3, 5);
    scene.add(frontFillLight);

    // ================= SHOWROOM ARCHITECTURE & ENVIRONMENT =================
    // 1. Polished Epoxy Showroom Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.25,
      metalness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Multi-tier Showroom Turntable Stage (Podium)
    const stagePlatformGeo = new THREE.CylinderGeometry(3.9, 4.0, 0.08, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0e1118,
      roughness: 0.3,
      metalness: 0.85,
    });
    const stagePlatform = new THREE.Mesh(stagePlatformGeo, stageMat);
    stagePlatform.position.y = 0.04;
    stagePlatform.receiveShadow = true;
    scene.add(stagePlatform);

    // Stage Chrome Bevel Rim
    const stageRimGeo = new THREE.TorusGeometry(3.95, 0.02, 16, 64);
    const stageRimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const stageRim = new THREE.Mesh(stageRimGeo, stageRimMat);
    stageRim.rotation.x = Math.PI / 2;
    stageRim.position.y = 0.08;
    scene.add(stageRim);

    // Circular Neon Halo Stage Rings
    const haloOuterGeo = new THREE.TorusGeometry(3.8, 0.03, 16, 64);
    const haloOuterMat = new THREE.MeshBasicMaterial({ color: 0x9cbbf8 });
    const haloOuter = new THREE.Mesh(haloOuterGeo, haloOuterMat);
    haloOuter.rotation.x = Math.PI / 2;
    haloOuter.position.y = 0.082;
    scene.add(haloOuter);

    const haloInnerGeo = new THREE.TorusGeometry(3.2, 0.02, 16, 64);
    const haloInnerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const haloInner = new THREE.Mesh(haloInnerGeo, haloInnerMat);
    haloInner.rotation.x = Math.PI / 2;
    haloInner.position.y = 0.083;
    scene.add(haloInner);

    // 3. Curved Studio Cyc Wall Backdrop
    const cycGeo = new THREE.CylinderGeometry(14, 14, 8, 48, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
    const cycMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.BackSide,
    });
    const cycWall = new THREE.Mesh(cycGeo, cycMat);
    cycWall.position.set(0, 4, 0);
    scene.add(cycWall);

    // Horizontal Neon Strip on Back Wall
    const cycStripGeo = new THREE.TorusGeometry(13.9, 0.03, 12, 48, Math.PI * 1.2);
    const cycStripMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
    const cycStrip = new THREE.Mesh(cycStripGeo, cycStripMat);
    cycStrip.rotation.x = Math.PI / 2;
    cycStrip.rotation.z = Math.PI * 0.4;
    cycStrip.position.set(0, 1.8, 0);
    scene.add(cycStrip);

    // 4. Showroom Architectural Columns (4 Pillars)
    const pillarPositions = [
      { x: -7, z: -6 },
      { x: 7, z: -6 },
      { x: -8, z: 4 },
      { x: 8, z: 4 },
    ];
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0b0d14, roughness: 0.5, metalness: 0.6 });
    const pillarNeonMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    pillarPositions.forEach((pos) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 0.5), pillarMat);
      pillar.position.set(pos.x, 3.5, pos.z);
      scene.add(pillar);

      const neon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.5, 0.06), pillarNeonMat);
      neon.position.set(pos.x + 0.26, 3.5, pos.z);
      scene.add(neon);
    });

    // 5. Suspended Overhead Studio Softbox Light Gantry
    const softboxGeo = new THREE.BoxGeometry(5.5, 0.1, 4.0);
    const softboxMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const softbox = new THREE.Mesh(softboxGeo, softboxMat);
    softbox.position.set(0, 5.2, 0);
    scene.add(softbox);

    const gantryFrameGeo = new THREE.BoxGeometry(5.8, 0.15, 4.3);
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, metalness: 0.9, roughness: 0.2 });
    const gantry = new THREE.Mesh(gantryFrameGeo, gantryMat);
    gantry.position.set(0, 5.25, 0);
    scene.add(gantry);

    // 5. Car Root Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const bodyMeshGroup = new THREE.Group();
    carGroup.add(bodyMeshGroup);

    const wheelsGroup = new THREE.Group();
    carGroup.add(wheelsGroup);

    const spoilerGroup = new THREE.Group();
    carGroup.add(spoilerGroup);

    const hoodGroup = new THREE.Group();
    carGroup.add(hoodGroup);

    const caliperGroup = new THREE.Group();
    carGroup.add(caliperGroup);

    const customModelGroup = new THREE.Group();
    carGroup.add(customModelGroup);

    const glbModelGroup = new THREE.Group();
    carGroup.add(glbModelGroup);

    // Paint Shader Material
    const carBodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0f1115),
      metalness: 0.3,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      carBodyMaterial,
      carGroup,
      bodyMeshGroup,
      wheelsGroup,
      spoilerGroup,
      hoodGroup,
      caliperGroup,
      customModelGroup,
      glbModelGroup,
    };

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if ("map" in m && m.map) (m.map as THREE.Texture).dispose();
              m.dispose();
            });
          } else if (mesh.material) {
            const m = mesh.material;
            if ("map" in m && m.map) (m.map as THREE.Texture).dispose();
            m.dispose();
          }
        }
      });

      renderer.dispose();
      threeRef.current = null;
    };
  }, []);

  // Update Paint Color & Finish
  useEffect(() => {
    if (!threeRef.current) return;
    const { carBodyMaterial } = threeRef.current;
    carBodyMaterial.color.set(paintColor.hex);

    switch (paintColor.finish) {
      case "Gloss":
        carBodyMaterial.clearcoat = 1.0;
        carBodyMaterial.roughness = 0.12;
        carBodyMaterial.metalness = 0.25;
        break;
      case "Metallic":
        carBodyMaterial.clearcoat = 1.0;
        carBodyMaterial.roughness = 0.22;
        carBodyMaterial.metalness = 0.88;
        break;
      case "Matte":
        carBodyMaterial.clearcoat = 0.0;
        carBodyMaterial.roughness = 0.75;
        carBodyMaterial.metalness = 0.1;
        break;
      case "Carbon":
        carBodyMaterial.clearcoat = 0.8;
        carBodyMaterial.roughness = 0.35;
        carBodyMaterial.metalness = 0.3;
        break;
    }
  }, [paintColor]);

  // Sync auto-rotation with OrbitControls
  useEffect(() => {
    if (!threeRef.current) return;
    threeRef.current.controls.autoRotate = isRotating;
    threeRef.current.controls.autoRotateSpeed = 1.5;
  }, [isRotating]);

  // ================= LOAD GLB 3D CAR MODEL FROM /public =================
  useEffect(() => {
    if (!threeRef.current) return;
    const { glbModelGroup, bodyMeshGroup, wheelsGroup, carBodyMaterial } = threeRef.current;

    glbModelGroup.clear();
    bodyMeshGroup.clear();
    wheelsGroup.clear();

    if (customModelFile) return; // Custom user imported model takes precedence

    const preset = CAR_MODELS.find((c) => c.id === selectedCarModelId) || CAR_MODELS[0];
    const glbPath = preset.modelFile;

    queueMicrotask(() => {
      setIsLoadingModel(true);
      setLoadProgress(0);
    });

    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      glbPath,
      (gltf) => {
        const model = gltf.scene;

        // Calculate Bounding Box to normalize scale and ground position
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Center on X and Z, and place cleanly on turntable stage (y = 0.08)
        model.position.x -= center.x;
        model.position.y -= box.min.y;
        model.position.z -= center.z;

        // Normalize scale to standard showroom length (~4.2 units length)
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetScale = maxDimension > 0 ? 4.2 / maxDimension : 0.01;
        model.scale.set(targetScale, targetScale, targetScale);

        // Traverse Model Hierarchy
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const meshName = mesh.name.toLowerCase();

            // Hide or skip stock wheels if user wants custom modular wheels
            if (
              meshName.includes("wheel") ||
              meshName.includes("tire") ||
              meshName.includes("rim") ||
              meshName.includes("roda")
            ) {
              // Stock wheels are kept unless replaced
            }

            // Assign Dynamic Paint Material to Body Parts
            if (
              meshName.includes("body") ||
              meshName.includes("paint") ||
              meshName.includes("chassis") ||
              meshName.includes("hood") ||
              meshName.includes("door") ||
              meshName.includes("bumper") ||
              meshName.includes("fender") ||
              meshName.includes("trunk") ||
              meshName.includes("car") ||
              meshName === "object001" ||
              meshName.includes("exterior")
            ) {
              mesh.material = carBodyMaterial;
            } else if (
              meshName.includes("glass") ||
              meshName.includes("windshield") ||
              meshName.includes("window")
            ) {
              // Tinted Glass Material
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: 0x0a0c10,
                transparent: true,
                opacity: 0.85,
                roughness: 0.05,
                metalness: 0.9,
              });
            } else if (
              meshName.includes("light") ||
              meshName.includes("headlight") ||
              meshName.includes("lamp")
            ) {
              mesh.material = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
            } else if (meshName.includes("carbon")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x15171e,
                roughness: 0.3,
                metalness: 0.4,
              });
            }
          }
        });

        glbModelGroup.add(model);
        setIsLoadingModel(false);

        // Build 4 Modular Wheels on the GLB vehicle arches
        buildVehicleWheels();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.warn("GLB load failed, using procedural car representation:", error);
        setIsLoadingModel(false);
        // Fallback procedural car body
        buildProceduralFallback();
        buildVehicleWheels();
      }
    );

    // Function to build the 4 modular wheels (supporting Enkei RPF1)
    const buildVehicleWheels = () => {
      const wbWidth = preset.wheelBaseWidth || 1.86;
      const wbLength = preset.wheelBaseLength || 2.6;

      const wheelPositions = [
        { x: -wbWidth / 2, y: 0.38, z: wbLength / 2, isLeft: true },
        { x: wbWidth / 2, y: 0.38, z: wbLength / 2, isLeft: false },
        { x: -wbWidth / 2, y: 0.4, z: -wbLength / 2, isLeft: true },
        { x: wbWidth / 2, y: 0.4, z: -wbLength / 2, isLeft: false },
      ];

      const rimColor = new THREE.Color(equippedVelg.colorTheme.primary);
      const rimMat = new THREE.MeshStandardMaterial({
        color: rimColor,
        metalness: 0.92,
        roughness: 0.2,
      });
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x16171a,
        roughness: 0.85,
        metalness: 0.1,
      });
      const rotorMat = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        metalness: 0.95,
        roughness: 0.2,
      });

      const caliperColorHex = equippedBrake.colorTheme.primary || "#eab308";
      const caliperMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(caliperColorHex),
        metalness: 0.6,
        roughness: 0.3,
      });

      wheelPositions.forEach((pos) => {
        const wheelSub = new THREE.Group();
        wheelSub.position.set(pos.x, pos.y, pos.z);

        // Tire Torus
        const tireTorus = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 20, 36), tireMat);
        tireTorus.rotation.y = Math.PI / 2;
        tireTorus.castShadow = true;
        wheelSub.add(tireTorus);

        if (equippedVelg.id === "enkei-rpf1") {
          // High-detail procedural Enkei RPF1 Model
          const rpf1Mesh = buildEnkeiRPF1Mesh({
            scale: 0.28,
            color: equippedVelg.colorTheme.primary || 0xdbe2ea,
            secondaryColor: equippedVelg.colorTheme.secondary,
            widthDepth: 0.38,
          });
          rpf1Mesh.rotation.y = pos.isLeft ? -Math.PI / 2 : Math.PI / 2;
          wheelSub.add(rpf1Mesh);
        } else {
          // Generic Rim
          const rimBarrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32, 1, true),
            rimMat
          );
          rimBarrel.rotation.z = Math.PI / 2;
          wheelSub.add(rimBarrel);

          const rimHub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 24), rimMat);
          rimHub.rotation.z = Math.PI / 2;
          wheelSub.add(rimHub);

          const spokeCount =
            equippedVelg.id === "volk-te37"
              ? 6
              : equippedVelg.id === "bbs-lm-r"
                ? 16
                : 10;

          for (let s = 0; s < spokeCount; s++) {
            const ang = (s * Math.PI * 2) / spokeCount;
            const spokeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.02), rimMat);
            spokeMesh.position.set(
              0.06 * (pos.isLeft ? -1 : 1),
              Math.sin(ang) * 0.2,
              Math.cos(ang) * 0.2
            );
            spokeMesh.rotation.x = ang;
            wheelSub.add(spokeMesh);
          }
        }

        // Brake Rotor & Caliper
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 28), rotorMat);
        rotor.rotation.z = Math.PI / 2;
        wheelSub.add(rotor);

        const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), caliperMat);
        caliper.position.set(0, 0.16, 0.05);
        wheelSub.add(caliper);

        wheelsGroup.add(wheelSub);
      });
    };

    // Procedural Car Body Fallback
    const buildProceduralFallback = () => {
      const lowerGeo = new THREE.BoxGeometry(1.82, 0.45, 4.3);
      const lower = new THREE.Mesh(lowerGeo, carBodyMaterial);
      lower.position.set(0, 0.48, 0);
      lower.castShadow = true;
      bodyMeshGroup.add(lower);

      const noseGeo = new THREE.BoxGeometry(1.78, 0.34, 1.4);
      const nose = new THREE.Mesh(noseGeo, carBodyMaterial);
      nose.position.set(0, 0.45, 1.7);
      nose.rotation.x = 0.08;
      nose.castShadow = true;
      bodyMeshGroup.add(nose);

      const cabinGeo = new THREE.BoxGeometry(1.38, 0.52, 2.0);
      const cabin = new THREE.Mesh(cabinGeo, carBodyMaterial);
      cabin.position.set(0, 0.85, -0.2);
      cabin.castShadow = true;
      bodyMeshGroup.add(cabin);
    };
  }, [
    selectedCarModelId,
    equippedVelg,
    equippedTyre,
    equippedBrake,
    customModelFile,
  ]);

  // Load Custom User Uploaded 3D Model (.glb, .gltf, .fbx)
  useEffect(() => {
    if (!threeRef.current || !customModelFile) return;
    const { customModelGroup, glbModelGroup, carBodyMaterial } = threeRef.current;
    customModelGroup.clear();
    glbModelGroup.clear();

    const fileUrl = URL.createObjectURL(customModelFile.file);

    if (customModelFile.type === "glb" || customModelFile.type === "gltf") {
      const loader = new GLTFLoader();
      loader.load(
        fileUrl,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (
                mesh.name.toLowerCase().includes("body") ||
                mesh.name.toLowerCase().includes("paint") ||
                mesh.name.toLowerCase().includes("car")
              ) {
                mesh.material = carBodyMaterial;
              }
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          model.position.x -= center.x;
          model.position.y -= box.min.y;
          model.position.z -= center.z;

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = (4.0 / maxDim) * customModelFile.scale;
          model.scale.set(scale, scale, scale);

          customModelGroup.add(model);
        },
        undefined,
        (err) => console.error("Error loading GLTF model:", err)
      );
    } else if (customModelFile.type === "fbx") {
      const loader = new FBXLoader();
      loader.load(
        fileUrl,
        (fbx) => {
          fbx.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          const box = new THREE.Box3().setFromObject(fbx);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          fbx.position.x -= center.x;
          fbx.position.y -= box.min.y;
          fbx.position.z -= center.z;

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = (4.0 / maxDim) * customModelFile.scale;
          fbx.scale.set(scale, scale, scale);

          customModelGroup.add(fbx);
        },
        undefined,
        (err) => console.error("Error loading FBX model:", err)
      );
    }

    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [customModelFile]);

  // Camera View Presets
  const setCameraView = (preset: string) => {
    if (!threeRef.current) return;
    const { camera, controls } = threeRef.current;
    setActiveCamPreset(preset);

    switch (preset) {
      case "3/4 Front":
        camera.position.set(4.8, 2.2, 5.2);
        controls.target.set(0, 0.6, 0);
        break;
      case "Side Profile":
        camera.position.set(6.5, 1.2, 0);
        controls.target.set(0, 0.6, 0);
        break;
      case "Rear Aero":
        camera.position.set(-4.5, 2.0, -5.0);
        controls.target.set(0, 0.6, 0);
        break;
      case "Wheel Zoom":
        camera.position.set(1.8, 0.5, 1.6);
        controls.target.set(1.0, 0.4, 1.35);
        break;
      case "Top Down":
        camera.position.set(0, 7.5, 0.1);
        controls.target.set(0, 0, 0);
        break;
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] xl:h-[620px] rounded-2xl bg-[#05060a] border border-white/[0.08] overflow-hidden shadow-2xl flex items-center justify-center select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP CAR MODEL SELECTOR TABS */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0d0f15]/90 border border-white/10 rounded-xl p-1.5 backdrop-blur-md font-mono text-xs z-10 shadow-2xl">
        {CAR_MODELS.map((car) => {
          const isSelected = selectedCarModelId === car.id && !customModelFile;
          return (
            <button
              key={car.id}
              onClick={() => onSelectCarModel(car.id)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${isSelected
                  ? "bg-[#253046] text-[#9cbbf8] border border-[#9cbbf8]/40 font-bold shadow-[0_0_12px_rgba(156,187,248,0.2)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{car.name}</span>
            </button>
          );
        })}
      </div>

      {/* Top Right Live Telemetry HUD Overlay */}
      <div className="absolute top-16 sm:top-4 right-4 bg-[#0d0f15]/80 border border-white/10 rounded-xl p-3 backdrop-blur-md font-mono text-xs text-neutral-300 pointer-events-none shadow-xl space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500 text-[10px]">PWR:</span>
          <span className="text-[#9cbbf8] font-bold">{currentCarData.power}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500 text-[10px]">TRQ:</span>
          <span className="text-white font-bold">{currentCarData.torque}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500 text-[10px]">WGT:</span>
          <span className="text-neutral-200 font-bold">{currentCarData.weight}</span>
        </div>
      </div>

      {/* Bottom Center Downforce Curve HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none font-mono hidden sm:block">
        <p className="text-[10px] text-neutral-400 tracking-wider">
          AERO BALANCE // {currentCarData.downforce}
        </p>
        <p className="text-xs sm:text-sm font-black text-white tracking-widest uppercase mt-0.5">
          DRAG COEFFICIENT: {currentCarData.drag}
        </p>
      </div>

      {/* Top Left Real-time Color Picker & Finish Customizer */}
      <div className="absolute top-16 sm:top-4 left-4 z-20 font-mono text-xs">
        <div className="bg-[#0d0f15]/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md shadow-2xl space-y-2.5 max-w-[280px]">
          {/* Header with Color Picker title & expand toggle */}
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
              <Palette className="w-3.5 h-3.5 text-[#9cbbf8]" />
              <span>COLOR PICKER</span>
            </div>
            <button
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-neutral-300 transition-colors flex items-center gap-1"
            >
              <span>{isColorPickerOpen ? "COLLAPSE" : "EXPAND"}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isColorPickerOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Color Picker & Live Hex Input Row */}
          <div className="flex items-center gap-3">
            {/* Interactive ColorPicker trigger */}
            <div className="shrink-0 flex items-center justify-center">
              <ColorPicker
                value={paintColor.hex}
                onChange={(color) => handleHexChange(color.toHexString())}
                showText={false}
                size="middle"
                arrow={false}
              />
            </div>

            {/* Hex Input & Name info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>HEX:</span>
                <span className="text-[#9cbbf8] font-bold">{paintColor.hex.toUpperCase()}</span>
              </div>
              <input
                type="text"
                value={paintColor.hex}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("#") && val.length <= 7) {
                    handleHexChange(val);
                  } else if (!val.startsWith("#") && val.length <= 6) {
                    handleHexChange("#" + val);
                  }
                }}
                className="w-full bg-black/60 border border-white/15 rounded px-2 py-1 text-xs text-white font-bold focus:border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8] outline-none font-mono"
                placeholder="#RRGGBB"
              />
            </div>
          </div>

          {/* Finish Mode Selector */}
          <div className="space-y-1 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>FINISH SHADER:</span>
              <span className="text-[#9cbbf8] font-bold">{paintColor.finish.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["Gloss", "Metallic", "Matte", "Carbon"] as const).map((finishMode) => {
                const isActive = paintColor.finish === finishMode;
                return (
                  <button
                    key={finishMode}
                    onClick={() => handleFinishChange(finishMode)}
                    className={`py-1 text-[10px] rounded transition-all font-bold ${isActive
                        ? "bg-[#9cbbf8] text-black shadow-[0_0_8px_rgba(156,187,248,0.4)]"
                        : "bg-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {finishMode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Presets Swatches */}
          {isColorPickerOpen && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] text-neutral-500 block">SUPERCAR OEM PRESETS:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {PAINT_COLORS.map((col) => {
                  const isSelected = paintColor.hex.toLowerCase() === col.hex.toLowerCase();
                  return (
                    <button
                      key={col.name}
                      onClick={() => {
                        setInternalPaintColor(col);
                        onPaintColorChange?.(col);
                      }}
                      title={`${col.name} (${col.finish})`}
                      className={`h-6 rounded-md transition-all flex items-center justify-center border text-[9px] font-bold truncate px-1 ${isSelected
                          ? "border-[#9cbbf8] scale-105 shadow-[0_0_8px_rgba(156,187,248,0.4)]"
                          : "border-white/10 hover:border-white/40 opacity-80 hover:opacity-100"
                        }`}
                      style={{
                        backgroundColor: col.hex,
                        color: ["#f0f2f5", "#facc15"].includes(col.hex) ? "#000" : "#fff",
                      }}
                    >
                      {isSelected ? "✓" : col.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading GLB Overlay Spinner */}
      {isLoadingModel && (
        <div className="absolute inset-0 bg-[#05060a]/80 backdrop-blur-md flex flex-col items-center justify-center z-30 font-mono">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#9cbbf8] animate-spin" />
            <span className="absolute text-[10px] font-bold text-white">
              {loadProgress > 0 ? `${loadProgress}%` : "3D"}
            </span>
          </div>
          <p className="text-xs font-bold text-white uppercase tracking-widest mt-3">
            LOADING 3D GLB CAR MODEL...
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            INITIALIZING SHOWROOM STUDIO SHADERS
          </p>
        </div>
      )}

      {/* Floating Bottom Left Camera View Presets */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#0d0f15]/80 border border-white/10 rounded-lg p-1 backdrop-blur-md font-mono text-[10px] z-10">
        {["3/4 Front", "Side Profile", "Rear Aero", "Wheel Zoom"].map((preset) => {
          const isActive = activeCamPreset === preset;
          return (
            <button
              key={preset}
              onClick={() => setCameraView(preset)}
              className={`px-2 py-1 rounded transition-colors ${isActive
                  ? "bg-[#9cbbf8] text-black font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* Floating Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all backdrop-blur-md flex items-center gap-1.5 ${isRotating
              ? "bg-[#9cbbf8] text-black border-[#9cbbf8] shadow-[0_0_12px_rgba(156,187,248,0.4)]"
              : "bg-[#0d0f15]/80 text-neutral-300 border-white/10 hover:text-white hover:bg-black/90"
            }`}
        >
          <Rotate3d className="w-4 h-4" />
          <span>{isRotating ? "ROTATING" : "AUTO ROTATE"}</span>
        </button>
      </div>
    </div>
  );
}
