<script>
    import Scene from '$lib/components/Scene.svelte';
    
    // Configuration parameters
    const config = {
      numberOfCandles: 5,  // Set your desired number of candles
      numberOfBalloons: 10, // Set your desired number of balloons
      friendName: "ARSHIYA!!"   // Your friend's name
    };
  </script>
  
  <svelte:head>
    <title>Happy Birthday {config.friendName}!</title>
  </svelte:head>
  
  <main>
    <div class="scene-container">
      <Scene 
        numberOfCandles={config.numberOfCandles} 
        numberOfBalloons={config.numberOfBalloons} 
      />
    </div>
    
    <div class="title-overlay">
      <h1>Happy Birthday {config.friendName}!</h1>
      <p>Blow on the candlesssss</p>
    </div>
  </main>
  
  <style>
    :global(body) {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif;
      background: linear-gradient(to bottom, #d9a7c7, #fffcdc);
      height: 100vh;
    }
  
    .scene-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
    }
  
    .title-overlay {
      position: absolute;
      top: 5%;
      width: 100%;
      text-align: center;
      pointer-events: none;
      z-index: 10;
      background: rgba(255, 255, 255, 0.3);
      padding: 0.4rem 0;
      backdrop-filter: blur(6px);
      border-radius: 15px;
      margin: 0 auto;
      max-width: 50%;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  
    h1 {
      font-size: 3rem;
      margin: 0.1rem;
      background: linear-gradient(45deg, #FF1493, #9400D3);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
      letter-spacing: 1px;
      animation: titlePulse 3s infinite;
      line-height: 1;
    }
  
    @keyframes titlePulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  
    p {
      font-size: 1.5rem;
      color: #4A154B;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
      margin: 0;
      line-height: 1.2;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 2.5rem;
      }
      p {
        font-size: 1.2rem;
      }
      .title-overlay {
        top: 2%;
        padding: 0.5rem 0;
      }
    }
  </style>