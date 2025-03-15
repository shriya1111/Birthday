<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    
    export let scene;
    export let position = { x: 0, y: 0, z: 0 };
    export let imageIndex = 0;
    
    let balloonGroup;
    
    // Temporary colored balloons until we have images
    const balloonColors = [
        0xff1a1a, // Bright red
        0x00ccff, // Bright blue
        0xffff00, // Bright yellow
        0xff66b2, // Bright pink
        0x33cc33  // Bright green
    ];
    
    onMount(async () => {
        try {
            // Create balloon group
            balloonGroup = new THREE.Group();
            
            // Create balloon shape (plane with balloon proportions)
            const width = 4;  // Make balloons larger
            const height = 5;
            const balloonGeom = new THREE.PlaneGeometry(width, height);
            
            // Use solid colors for now
            const balloonMaterial = new THREE.MeshBasicMaterial({
                color: balloonColors[imageIndex % balloonColors.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1  // Full opacity
            });
            
            // Create balloon mesh
            const balloonMesh = new THREE.Mesh(balloonGeom, balloonMaterial);
            balloonGroup.add(balloonMesh);
            
            // Create string (thin white line)
            const stringGeom = new THREE.PlaneGeometry(0.08, 3);  // Slightly thicker and longer string
            const stringMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,  // Black string
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const stringMesh = new THREE.Mesh(stringGeom, stringMaterial);
            stringMesh.position.y = -4;
            balloonGroup.add(stringMesh);
            
            // Position balloon group
            balloonGroup.position.set(position.x, position.y, position.z);
            
            // Add to scene
            scene.add(balloonGroup);
            
            // Animate balloon
            function animateBalloon() {
                if (!balloonGroup || !scene || !scene.camera) return;
                
                const time = Date.now() * 0.001;
                const uniqueOffset = imageIndex * 0.5;
                
                // Gentle floating motion
                const hoverX = Math.sin(time + uniqueOffset) * 0.3;
                balloonGroup.position.x = position.x + hoverX;
                balloonGroup.position.y = position.y;
                balloonGroup.position.z = position.z;
                
                // Always face the camera
                balloonGroup.lookAt(scene.camera.position);
                
                requestAnimationFrame(animateBalloon);
            }
            
            // Start animation only when camera is available
            if (scene.camera) {
                animateBalloon();
            } else {
                // Wait for camera to be available
                const checkCamera = () => {
                    if (scene.camera) {
                        animateBalloon();
                    } else {
                        requestAnimationFrame(checkCamera);
                    }
                };
                checkCamera();
            }
            
        } catch (error) {
            console.error('Error creating balloon:', error);
        }
        
        return () => {
            if (balloonGroup) {
                scene.remove(balloonGroup);
            }
        };
    });
</script>