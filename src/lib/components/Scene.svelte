<script>
    import { onMount, tick } from 'svelte';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import Cake from './Cake.svelte';
    import Balloon from './Balloon.svelte';
    
    // Import all balloon images
    const balloonImages = Array.from({ length: 14 }, (_, i) => 
        `/images/image${i + 1}.jpeg`
    );

    export let numberOfCandles = 5;
    export let numberOfBalloons = 10;
    
    let container;
    let scene;
    let camera;
    let renderer;
    let controls;
    let balloons = [];
    let isBlowing = false;
    let blowingPower = 0;
    let blowingTimeout;
    let audioContext;
    let analyser;
    let dataArray;
    
    // Initialize balloons with random positions
    function initBalloons() {
      balloons = [];
      for (let i = 0; i < numberOfBalloons; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const speed = 0.08 + Math.random() * 0.04;
        const size = 80 + Math.random() * 40;
        const imageIndex = Math.floor(Math.random() * 14) + 1;
        
        balloons.push({ 
          id: i, 
          x, 
          y, 
          speed, 
          size,
          imageIndex,
          wobbleOffset: Math.random() * Math.PI * 2 
        });
      }
    }
    
    // Update balloon positions
    function updateBalloons() {
      balloons = balloons.map(balloon => {
        balloon.y -= balloon.speed;
        balloon.x += Math.sin(Date.now() * 0.002 + balloon.wobbleOffset) * 0.05; // Increased wobble
        
        // Reset balloon when it goes off screen
        if (balloon.y < -20) {
          balloon.y = 110 + Math.random() * 10;
          balloon.x = Math.random() * 100;
          balloon.imageIndex = Math.floor(Math.random() * 14) + 1; // Random image (1-14)
        }
        
        return balloon;
      });
    }
    
    // Initialize microphone for candle blowing
    async function initMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Start monitoring audio levels
        monitorBlowing();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Please allow microphone access to blow out the candles!");
      }
    }
    
    // Monitor microphone for blowing
    function monitorBlowing() {
      let sustainedBlowingFrames = 0;
      const requiredFrames = 10; // Need sustained blowing for ~10 frames
      
      function checkAudioLevel() {
        if (!analyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Detect blowing (low frequency with high amplitude)
        if (average > 50) {
          sustainedBlowingFrames++;
          if (sustainedBlowingFrames >= requiredFrames) {
            isBlowing = true;
            blowingPower = Math.min((average / 200) * (sustainedBlowingFrames / requiredFrames), 1);
          }
          
          clearTimeout(blowingTimeout);
          blowingTimeout = setTimeout(() => {
            isBlowing = false;
            blowingPower = 0;
            sustainedBlowingFrames = 0;
          }, 300);
        } else {
          sustainedBlowingFrames = Math.max(0, sustainedBlowingFrames - 1);
        }
        
        requestAnimationFrame(checkAudioLevel);
      }
      
      checkAudioLevel();
    }
    
    onMount(async () => {
      // Initialize Three.js scene and camera first
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 8, 12); // Lower camera position

      // Initialize renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.zIndex = '10';  // Ensure renderer is on top
      container.appendChild(renderer.domElement);

      // Set up controls - only for cake rotation
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2;
      controls.minDistance = 12;
      controls.maxDistance = 12;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.target.set(0, 3, 0);  // Lower target point
      controls.update();

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(5, 8, 5);  // Adjusted light position
      mainLight.castShadow = true;
      scene.add(mainLight);

      // Add a subtle point light for extra vibrancy
      const accentLight = new THREE.PointLight(0xfff0f0, 0.8, 20);
      accentLight.position.set(-5, 5, -5);  // Adjusted light position
      scene.add(accentLight);

      // Initialize balloons
      initBalloons();

      // Initialize microphone
      await initMicrophone();

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        updateBalloons();
        renderer.render(scene, camera);
      }
      animate();

      // Handle window resize
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onWindowResize);

      return () => {
        window.removeEventListener('resize', onWindowResize);
        container.removeChild(renderer.domElement);
      };
    });

    function getColorForImage(imageIndex) {
        // Define a color palette for different balloon images
        const colors = {
            1: '#ff6b6b',   // Red
            2: '#4ecdc4',   // Teal
            3: '#ffbe0b',   // Yellow
            4: '#ff006e',   // Pink
            5: '#8338ec',   // Purple
            6: '#3a86ff',   // Blue
            7: '#fb5607',   // Orange
            8: '#06d6a0',   // Mint
            9: '#ef476f',   // Rose
            10: '#ffd93d',  // Gold
            11: '#4cc9f0',  // Sky Blue
            12: '#f72585',  // Magenta
            13: '#7209b7',  // Deep Purple
            14: '#4361ee'   // Royal Blue
        };
        return colors[imageIndex] || '#ff6b6b'; // Default to red if index not found
    }

    // Update the handleImageError function
    function handleImageError(event) {
        const img = event.target;
        const currentIndex = parseInt(img.src.match(/image(\d+)\.jpeg/)[1]);
        const nextIndex = (currentIndex % 14) + 1;
        img.src = `/images/image${nextIndex}.jpeg`;
    }
</script>
  
<div class="scene-container" bind:this={container}>
    <!-- Background with gradient (bottom layer) -->
    <div class="background-gradient"></div>

    <!-- 2D Balloons (middle layer) -->
    <div class="balloons-container">
        {#each balloons as balloon (balloon.id)}
            <div
                class="balloon"
                style="
                    left: {balloon.x}%;
                    top: {balloon.y}%;
                    width: {balloon.size}px;
                    height: {balloon.size * 1.2}px;
                    --balloon-color: {getColorForImage(balloon.imageIndex)};
                "
            >
                <div class="balloon-border">
                    <div class="balloon-content">
                        <img 
                            src={`/images/image${balloon.imageIndex}.jpeg`}
                            alt="balloon {balloon.imageIndex}"
                            class="balloon-image"
                            on:error={handleImageError}
                        />
                    </div>
                </div>
                <div class="balloon-string"></div>
            </div>
        {/each}
    </div>

    <!-- 3D Scene (top layer) -->
    <div class="scene-3d">
        {#if scene}
            <Cake 
                {scene}
                {numberOfCandles} 
                {isBlowing} 
                {blowingPower} 
            />
        {/if}
    </div>
</div>
  
<style>
    .scene-container {
      width: 100%;
      height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .background-gradient {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, #d9a7c7, #fffcdc);
      z-index: 1;  /* Bottom layer */
    }

    .balloons-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;  /* Middle layer */
    }

    .scene-3d {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 3;  /* Just below the renderer canvas */
    }

    .balloon {
        position: absolute;
        transform: translateX(-50%);
        transition: transform 0.1s ease-out;
    }

    .balloon-border {
        width: 100%;
        height: 100%;
        position: relative;
        border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
        padding: 4px;
        background: var(--balloon-color);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .balloon-content {
        width: 100%;
        height: 100%;
        border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
        overflow: hidden;
        background: white;
    }

    .balloon-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.1);
    }

    .balloon-string {
        position: absolute;
        width: 2px;
        height: 100px;
        background: rgba(0, 0, 0, 0.3);
        left: 50%;
        top: 98%;
        transform-origin: top;
        transform: translateX(-50%);
    }

    :global(body) {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
</style>