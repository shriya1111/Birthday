<script>
    import { onMount, tick } from 'svelte';
    import * as THREE from 'three';
    
    export let scene;
    export let position = { x: 0, y: 0, z: 0 };
    export let index = 0;
    export let isBlowing = false;
    export let blowingPower = 0;
    
    let candleMesh;
    let flameMesh;
    let glowMesh;
    let lightSource;
    let isLit = true;
    
    // Colors for different candles
    const candleColors = [
      0xffb7d5, // Pink
      0xbde0fe, // Light blue
      0xe0c3fc, // Lavender
      0xffdac1, // Peach
      0xa2d2ff, // Sky blue
      0xc9b6e4, // Light purple
      0xb5e48c, // Light green
      0xfbc4ab  // Light orange
    ];
    
    onMount(async () => {
      // Create candle group
      const candleGroup = new THREE.Group();
      
      // Create candle - made taller and slightly thinner
      const candleGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16);  // Adjusted height to match new position
      const candleMaterial = new THREE.MeshPhongMaterial({ 
        color: candleColors[index % candleColors.length],
        shininess: 30
      });
      
      candleMesh = new THREE.Mesh(candleGeom, candleMaterial);
      candleMesh.position.y = 0.4;  // Set to requested position
      candleMesh.castShadow = true;
      candleGroup.add(candleMesh);
      
      // Create larger flame (cone shape)
      const flameGeom = new THREE.ConeGeometry(0.08, 0.35, 16);
      const flameMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffcc33,
        transparent: true,
        opacity: 0.9
      });
      
      flameMesh = new THREE.Mesh(flameGeom, flameMaterial);
      flameMesh.position.y = 1.0;  // Adjusted to match new candle height
      candleGroup.add(flameMesh);
      
      // Add stronger point light for flame
      lightSource = new THREE.PointLight(0xffcc33, 0.8, 4);
      lightSource.position.copy(flameMesh.position);
      candleGroup.add(lightSource);
      
      // Add glow effect
      const glowGeom = new THREE.SphereGeometry(0.15, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc33,
        transparent: true,
        opacity: 0.4
      });
      
      glowMesh = new THREE.Mesh(glowGeom, glowMaterial);
      glowMesh.position.copy(flameMesh.position);
      candleGroup.add(glowMesh);
      
      // Position the entire candle group
      candleGroup.position.set(position.x, position.y, position.z);
      
      // Add to scene
      scene.add(candleGroup);
      
      return () => {
        scene.remove(candleGroup);
      };
    });
    
    $: {
      if (flameMesh && lightSource && glowMesh) {
        if (isBlowing) {
          // Simulate flame movement based on blowing power
          const flameAngle = Math.PI / 4 * blowingPower;
          flameMesh.rotation.x = flameAngle;
          lightSource.position.x = flameMesh.position.x + Math.sin(flameAngle) * 0.3;
          lightSource.position.y = flameMesh.position.y - Math.cos(flameAngle) * 0.3;
          glowMesh.position.copy(lightSource.position);
          
          // Only extinguish with strong sustained blowing
          if (blowingPower > 0.85 && Math.random() < blowingPower * 0.15) {
            isLit = false;
            extinguishCandle();
          }
        } else {
          // Reset flame position when not blowing
          flameMesh.rotation.x = 0;
          lightSource.position.copy(flameMesh.position);
          glowMesh.position.copy(flameMesh.position);
        }
        
        // Update flame and light visibility
        flameMesh.visible = isLit;
        glowMesh.visible = isLit;
        lightSource.intensity = isLit ? 0.8 : 0;
      }
    }
    
    function extinguishCandle() {
      if (!isLit) return;
      
      isLit = false;
      
      // Hide flame and glow
      if (flameMesh) {
        flameMesh.visible = false;
      }
      
      if (glowMesh) {
        glowMesh.visible = false;
      }
      
      // Turn off light
      if (lightSource) {
        lightSource.intensity = 0;
      }
      
      // Add smoke particles (simplified)
      const smokeGeom = new THREE.SphereGeometry(0.05, 8, 8);
      const smokeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.7
      });
      
      const smoke = new THREE.Mesh(smokeGeom, smokeMaterial);
      smoke.position.copy(flameMesh.position);
      scene.add(smoke);
      
      // Animate smoke rising and fading
      let smokeY = 0;
      const animateSmoke = () => {
        if (smokeY > 1) {
          scene.remove(smoke);
          return;
        }
        
        smokeY += 0.02;
        smoke.position.y += 0.02;
        smoke.scale.x += 0.01;
        smoke.scale.z += 0.01;
        smokeMaterial.opacity -= 0.01;
        
        requestAnimationFrame(animateSmoke);
      };
      
      animateSmoke();
    }
  </script>