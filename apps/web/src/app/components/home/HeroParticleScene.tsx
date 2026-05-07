"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { theme } from "../../../theme/theme";

export default function HeroParticleScene({ query, active }: { query?: string; active?: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(active);
  const queryRef = useRef(query);

  useEffect(() => {
    activeRef.current = active;
    queryRef.current = query;
  }, [active, query]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.navigator.userAgent.includes("jsdom")) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(0, 0.8, 11);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 520;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const colorBlue = new THREE.Color(theme.colors.home.accent);
    const colorGold = new THREE.Color(theme.colors.home.gold);
    const colorWhite = new THREE.Color("#dbeafe");
    const dotCanvas = document.createElement("canvas");
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const dotContext = dotCanvas.getContext("2d");
    if (dotContext) {
      const gradient = dotContext.createRadialGradient(32, 32, 0, 32, 32, 30);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.35, "rgba(255,255,255,0.86)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      dotContext.fillStyle = gradient;
      dotContext.fillRect(0, 0, 64, 64);
    }
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.5 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const band = (Math.random() - 0.5) * 3.2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = band + Math.sin(angle * 2.2) * 0.6;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius - Math.random() * 2;

      const mixed = Math.random() > 0.86 ? colorGold : Math.random() > 0.42 ? colorBlue : colorWhite;
      particleColors[index * 3] = mixed.r;
      particleColors[index * 3 + 1] = mixed.g;
      particleColors[index * 3 + 2] = mixed.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.035,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    const ringGroup = new THREE.Group();
    group.add(ringGroup);
    const nodeGeometry = new THREE.IcosahedronGeometry(0.08, 1);
    const blueNodeMaterial = new THREE.MeshBasicMaterial({ color: theme.colors.home.accent, transparent: true, opacity: 0.92 });
    const goldNodeMaterial = new THREE.MeshBasicMaterial({ color: theme.colors.home.gold, transparent: true, opacity: 0.88 });
    const nodePositions: THREE.Vector3[] = [];

    for (let index = 0; index < 16; index += 1) {
      const angle = (index / 16) * Math.PI * 2;
      const radius = 4.6 + (index % 4) * 0.38;
      const position = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(index * 1.7) * 0.8, Math.sin(angle) * radius * 0.42);
      nodePositions.push(position);
      const node = new THREE.Mesh(nodeGeometry, index % 5 === 0 ? goldNodeMaterial : blueNodeMaterial);
      node.position.copy(position);
      ringGroup.add(node);
    }

    const linePositions: number[] = [];
    for (let index = 0; index < nodePositions.length; index += 1) {
      const current = nodePositions[index];
      const next = nodePositions[(index + 1) % nodePositions.length];
      linePositions.push(current.x, current.y, current.z, next.x, next.y, next.z);
      if (index % 3 === 0) {
        const far = nodePositions[(index + 5) % nodePositions.length];
        linePositions.push(current.x, current.y, current.z, far.x, far.y, far.z);
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: theme.colors.home.accent, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }),
    );
    ringGroup.add(lines);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(4.85, 0.006, 8, 160),
      new THREE.MeshBasicMaterial({ color: theme.colors.home.gold, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending }),
    );
    orbit.rotation.x = Math.PI / 2.5;
    ringGroup.add(orbit);

    const beamGeometry = new THREE.BufferGeometry();
    beamGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-5.4, -1.2, 0.6, -2.8, -0.3, 0.2, -0.6, -0.2, 0, 1.8, 0.55, -0.3, 5.3, 1.1, -0.7], 3),
    );
    const beam = new THREE.Line(
      beamGeometry,
      new THREE.LineBasicMaterial({ color: theme.colors.home.gold, transparent: true, opacity: activeRef.current ? 0.78 : 0.38, blending: THREE.AdditiveBlending }),
    );
    scene.add(beam);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    };

    let frame = 0;
    let inViewport = true;
    let pageVisible = document.visibilityState === "visible";
    const clock = new THREE.Clock();
    const shouldAnimate = () => !reducedMotion && inViewport && pageVisible;
    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      const isEngaged = activeRef.current || Boolean(queryRef.current);
      const energy = isEngaged ? 1.65 : 1;
      group.rotation.y = elapsed * 0.035 * energy;
      group.rotation.x = Math.sin(elapsed * 0.18) * 0.04;
      ringGroup.rotation.z = elapsed * 0.045 * energy;
      beam.material.opacity = isEngaged ? 0.58 + Math.sin(elapsed * 3) * 0.18 : 0.32 + Math.sin(elapsed * 1.6) * 0.08;
      renderer.render(scene, camera);
    };
    const stopLoop = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const animate = () => {
      frame = 0;
      renderFrame();
      if (shouldAnimate()) {
        frame = window.requestAnimationFrame(animate);
      }
    };
    const startLoop = () => {
      if (frame || !shouldAnimate()) return;
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(host);
    if (!observer) window.addEventListener("resize", resize);
    const visibilityObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              inViewport = entry?.isIntersecting ?? true;
              if (shouldAnimate()) startLoop();
              else stopLoop();
            },
            { threshold: 0.01 },
          );
    visibilityObserver?.observe(host);
    const handleVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (shouldAnimate()) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    renderFrame();
    startLoop();

    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resize);
      visibilityObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopLoop();
      particleGeometry.dispose();
      particleMaterial.dispose();
      dotTexture.dispose();
      nodeGeometry.dispose();
      blueNodeMaterial.dispose();
      goldNodeMaterial.dispose();
      lineGeometry.dispose();
      beamGeometry.dispose();
      orbit.geometry.dispose();
      (orbit.material as THREE.Material).dispose();
      (lines.material as THREE.Material).dispose();
      (beam.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      data-testid="hero-particle-scene"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(180deg,black_0%,black_78%,transparent_100%)]"
    />
  );
}
