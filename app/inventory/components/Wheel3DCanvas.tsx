"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WheelItem } from "../data/wheels";

import { buildEnkeiRPF1Mesh } from "@/app/workshop/utils/enkeiRPF1Builder";

interface Wheel3DCanvasProps {
  wheel: WheelItem;
}

export default function Wheel3DCanvas({ wheel }: Wheel3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(isRotating);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer setup
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.replaceChildren(renderer.domElement);

    // Group to hold the wheel assembly
    const wheelGroup = new THREE.Group();
    scene.add(wheelGroup);

    // Color conversion
    const primaryColor = new THREE.Color(wheel.colorTheme.primary);
    const secondaryColor = new THREE.Color(wheel.colorTheme.secondary);

    // Tire Material
    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x141518,
      metalness: 0.05,
      roughness: 0.85,
    });

    const brakeRotorMaterial = new THREE.MeshStandardMaterial({
      color: 0x555861,
      metalness: 0.95,
      roughness: 0.2,
    });

    const caliperMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.4,
      roughness: 0.3,
    });

    // 1. Tire Ring (Torus) with Tread Grooves
    const tireGeo = new THREE.TorusGeometry(1.42, 0.26, 24, 64);
    const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
    wheelGroup.add(tireMesh);

    if (wheel.id === "enkei-rpf1") {
      // Use the precision-crafted procedural Enkei RPF1 3D model
      const enkeiMesh = buildEnkeiRPF1Mesh({
        scale: 1.0,
        color: wheel.colorTheme.primary || 0xdbe2ea,
        secondaryColor: wheel.colorTheme.secondary,
        widthDepth: 0.55,
      });
      wheelGroup.add(enkeiMesh);
    } else {
      // Standard / Generic Fallback Rim
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: primaryColor,
        metalness: wheel.material === "Carbon" ? 0.2 : 0.9,
        roughness: wheel.material === "Carbon" ? 0.4 : 0.25,
      });

      // 2. Outer Rim Barrel (Cylinder / Tube)
      const rimOuterGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.6, 48, 1, true);
      const rimOuter = new THREE.Mesh(rimOuterGeo, rimMaterial);
      rimOuter.rotation.x = Math.PI / 2;
      wheelGroup.add(rimOuter);

      // Stepped Rim Lip
      const rimLipGeo = new THREE.TorusGeometry(1.2, 0.06, 16, 48);
      const rimLip = new THREE.Mesh(rimLipGeo, rimMaterial);
      wheelGroup.add(rimLip);

      // 3. Center Hub
      const hubGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.25, 32);
      const hub = new THREE.Mesh(hubGeo, rimMaterial);
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(hub);

      // Center Cap
      const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.28, 24);
      const capMat = new THREE.MeshStandardMaterial({
        color: secondaryColor,
        metalness: 0.8,
        roughness: 0.3,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = Math.PI / 2;
      wheelGroup.add(cap);

      // 4. Spokes Geometry
      const spokeCount =
        wheel.id === "volk-te37"
          ? 6
          : wheel.id === "bbs-lm-r"
          ? 16
          : 10;

      for (let i = 0; i < spokeCount; i++) {
        const angle = (i * Math.PI * 2) / spokeCount;
        const spokeLength = 0.85;

        const spokeGeo = new THREE.BoxGeometry(
          wheel.id === "volk-te37" ? 0.18 : 0.08,
          spokeLength,
          0.06
        );
        const spoke = new THREE.Mesh(spokeGeo, rimMaterial);

        const midR = 0.75;
        spoke.position.set(
          Math.sin(angle) * midR,
          Math.cos(angle) * midR,
          0.04
        );
        spoke.rotation.z = -angle;
        spoke.rotation.x = 0.08;
        wheelGroup.add(spoke);
      }
    }

    // 5. Brake Rotor behind rim
    const rotorGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.04, 36);
    const rotor = new THREE.Mesh(rotorGeo, brakeRotorMaterial);
    rotor.rotation.x = Math.PI / 2;
    rotor.position.z = -0.2;
    scene.add(rotor);

    // 6. Brake Caliper (Fixed)
    const caliperGeo = new THREE.BoxGeometry(0.25, 0.55, 0.2);
    const caliper = new THREE.Mesh(caliperGeo, caliperMaterial);
    caliper.position.set(0.78, 0.3, -0.15);
    scene.add(caliper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const blueRimLight = new THREE.PointLight(0x9cbbf8, 3.5, 10);
    blueRimLight.position.set(-3, -2, 2);
    scene.add(blueRimLight);

    const topCyanLight = new THREE.PointLight(0x00e5ff, 2.0, 8);
    topCyanLight.position.set(0, 3, 2);
    scene.add(topCyanLight);

    // Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      wheelGroup.rotation.y += deltaX * 0.015;
      wheelGroup.rotation.x += deltaY * 0.015;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotatingRef.current && !isDragging) {
        wheelGroup.rotation.y += 0.008;
      }

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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [wheel]);

  return (
    <div className="relative w-full h-full min-h-[280px] sm:min-h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
      
      {/* 3D Orbit Control Hints */}
      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-neutral-400 bg-[#0c0e14]/80 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>DRAG TO ROTATE 3D</span>
      </div>

      <button
        onClick={() => setIsRotating((prev) => !prev)}
        className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 border border-white/10 transition-colors"
      >
        {isRotating ? "PAUSE ROTATION" : "AUTO ROTATE"}
      </button>
    </div>
  );
}
