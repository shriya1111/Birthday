<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import Candle from './Candle.svelte';
    
    export let scene;
    export let isBlowing = false;
    export let blowingPower = 0;
    
    let cakeMesh;
    let candlePositions = [];
    let candlesReady = false;
    
    onMount(() => {
      // Calculate candle positions in two circles
      const innerRadius = 1.3;  // Inner circle radius
      const outerRadius = 2.2;  // Outer circle radius
      const innerCount = 8;     // Number of candles in inner circle
      const outerCount = 15;    // Number of candles in outer circle
      
      // Add inner circle candles
      for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2;
        const x = Math.sin(angle) * innerRadius;
        const z = Math.cos(angle) * innerRadius;
        candlePositions.push({ x, y: 4.5, z, angle });
      }
      
      // Add outer circle candles
      for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const x = Math.sin(angle) * outerRadius;
        const z = Math.cos(angle) * outerRadius;
        candlePositions.push({ x, y: 4.5, z, angle });
      }
      
      candlesReady = true;
      
      // Create cake geometry
      const cakeBottom = new THREE.CylinderGeometry(4, 4, 1.5, 32);
      const cakeMid = new THREE.CylinderGeometry(3.3, 4, 1.5, 32);
      const cakeTop = new THREE.CylinderGeometry(2.6, 3.3, 1.5, 32);
      
      // Create cake materials with vibrant colors
      const icingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf0e6fa,  // Original light lavender
        shininess: 0,     // Increased shininess
        specular: 0xffffff,
        emissive: 0x200020  // Subtle glow
      });
      
      const cakeBaseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0e6fa,  // Original light pink
        shininess: 0,     // Increased shininess
        specular: 0xffffff,
        emissive: 0x200020  // Subtle glow
      });
      
      const frostingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf562e6,  // Original mint green
        shininess: 0,     // Increased shininess
        specular: 0xffffff,
        emissive: 0x002020  // Subtle glow
      });
      
      // Create cake layers with adjusted positions for new heights
      const bottomMesh = new THREE.Mesh(cakeBottom, cakeBaseMaterial);
      bottomMesh.position.y = 0.75;
      bottomMesh.castShadow = true;
      bottomMesh.receiveShadow = true;
      
      const midMesh = new THREE.Mesh(cakeMid, frostingMaterial);
      midMesh.position.y = 2.25;
      midMesh.castShadow = true;
      midMesh.receiveShadow = true;
      
      const topMesh = new THREE.Mesh(cakeTop, icingMaterial);
      topMesh.position.y = 3.75;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      
      // Create cake group
      cakeMesh = new THREE.Group();
      cakeMesh.add(bottomMesh);
      cakeMesh.add(midMesh);
      cakeMesh.add(topMesh);
      
      // Add decorative details
      addCakeDecorations(cakeMesh);
      
      // Add cake to scene
      scene.add(cakeMesh);
      
      // Add plate
      const plateGeometry = new THREE.CylinderGeometry(4.5, 4.5, 0.2, 32);
      const plateMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,
        specular: 0xffffff,
        emissive: 0x111111
      });
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.position.y = -0.1;
      plate.castShadow = true;
      plate.receiveShadow = true;
      cakeMesh.add(plate);
      
      return () => {
        scene.remove(cakeMesh);
      };
    });
    
    function addCakeDecorations(cakeMesh) {
      // Add small decorative spheres around the top edge
      const sphereGeom = new THREE.SphereGeometry(0.25, 16, 16);
      const colors = [0xffdde1, 0xffb7d5, 0xe0c3fc, 0xbde0fe, 0xa2d2ff];
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 2.3;
        const z = Math.cos(angle) * 2.3;
        
        const material = new THREE.MeshPhongMaterial({ 
          color: colors[i % colors.length],
          shininess: 90,
          specular: 0xffffff,
          emissive: 0x100010
        });
        
        const sphere = new THREE.Mesh(sphereGeom, material);
        sphere.position.set(x, 4.5, z);
        sphere.castShadow = true;
        cakeMesh.add(sphere);
      }
      
      // Add subtle frosting details on the sides
      const frostingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,
        specular: 0xffffff,
        emissive: 0x111111
      });
      
      // Add "frosting" drips down the sides
      const dripMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff9ecd,
        shininess: 60,
        specular: 0xffffff
      });
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 2.5;
        const z = Math.cos(angle) * 2.5;
        
        // Create a drip using an elongated sphere
        const height = 0.4 + Math.random() * 0.4; // Shorter drips
        const dripGeom = new THREE.CapsuleGeometry(0.15, height, 8, 8);
        const drip = new THREE.Mesh(dripGeom, dripMaterial);
        drip.position.set(x, 4.5 - height/2, z);
        drip.castShadow = true;
        cakeMesh.add(drip);
      }

      // Add small dots around middle layer
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 3.4;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const dotGeom = new THREE.SphereGeometry(0.1, 8, 8);
        const dot = new THREE.Mesh(dotGeom, frostingMaterial);
        dot.position.set(x, 2.25, z);
        dot.castShadow = true;
        cakeMesh.add(dot);
      }
    }
</script>
  
<!-- Three.js rendering happens in the container -->
<div class="cake-container">
  {#if candlesReady}
    {#each candlePositions as position, i}
      <Candle 
        {scene}
        position={position} 
        index={i} 
        {isBlowing} 
        {blowingPower} 
      />
    {/each}
  {/if}
</div>
  
<style>
  .cake-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
</style>