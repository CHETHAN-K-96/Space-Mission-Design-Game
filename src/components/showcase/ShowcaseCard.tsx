"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ShowcaseComponent } from "../../data/showcaseComponents";

interface ShowcaseCardProps {
  component: ShowcaseComponent;
}

export function ShowcaseCard({ component }: ShowcaseCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 250;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(1.6, 1.2, 1.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    const blueBacklight = new THREE.DirectionalLight(0x0284c7, 0.5);
    blueBacklight.position.set(-3, -2, -2);
    scene.add(blueBacklight);

    // Grid platform (1 Block footprint)
    const gridHelper = new THREE.GridHelper(1.2, 4, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Add 3D model
    const model = component.buildModel();
    scene.add(model);

    // Interactive mouse drag rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      model.rotation.y += deltaX * 0.015;
      model.rotation.x += deltaY * 0.015;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      model.rotation.y += deltaX * 0.015;
      model.rotation.x += deltaY * 0.015;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        model.rotation.y += 0.008; // smooth idle spin
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [component]);

  const heritageBadgeText = (() => {
    const parts = component.flightHeritage.split(" ");
    return `${parts[0]} ${parts[1] || ""}`;
  })();

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400">
      {/* 3D Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[250px] relative cursor-grab active:cursor-grabbing bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]"
      >
        <span className="absolute top-3 left-3 bg-slate-900/90 border border-cyan-600 text-cyan-400 px-2 py-1 text-[10px] font-bold rounded font-mono tracking-wider z-10">
          {component.subsystem}
        </span>
        <span className="absolute top-3 right-3 bg-emerald-950/70 border border-emerald-500 text-emerald-400 px-2 py-1 text-[10px] font-bold rounded font-mono z-10">
          {heritageBadgeText}
        </span>
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col gap-2.5 bg-slate-900 border-t border-slate-800 flex-1">
        <div className="text-base font-bold text-slate-100 flex items-center justify-between">
          <span>{component.name}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {component.description}
        </p>

        {/* Voxel Assembly Recipe */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
          <div className="font-bold text-cyan-400 mb-1 font-mono text-[11px] flex items-center gap-1">
            <span>🛠️</span> VOXEL ASSEMBLY BLUEPRINT:
          </div>
          <div>{component.recipe}</div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 gap-1.5 mt-1 font-mono">
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            MASS
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.mass}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            POWER
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.power}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            THRUST
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.thrust}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded text-center text-[10px] text-slate-400 border border-slate-700/60">
            COST
            <strong className="block text-xs text-slate-100 mt-0.5">
              {component.specs.cost}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
