<script lang="ts">
  import InteractiveSim from '../InteractiveSim.svelte';

  // State
  let mode: 'play' | 'scroll' | 'manual' = 'scroll';
  let time = 0;
  const duration = 8; // 2 complete cycles (period = 4s)
  const frequency = 0.25; // 1 cycle every 4 seconds
  const omega = 2 * Math.PI * frequency;
  const amplitude = 60; // Max displacement in pixels

  // Canvas drawing callback
  function render(context: CanvasRenderingContext2D | SVGElement, t: number) {
    const ctx = context as CanvasRenderingContext2D;
    const width = 600;
    const height = 300;
    
    // Physics calculation
    const displacement = amplitude * Math.cos(omega * t);
    
    // Coordinates
    const centerY = height / 2;
    const massX = 120;
    const massY = centerY + displacement;
    const supportY = 40;
    const radius = 22;

    // 1. Draw Grid / Axes for the graph
    const graphLeft = 260;
    const graphRight = 550;
    const graphWidth = graphRight - graphLeft;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(graphLeft, centerY);
    ctx.lineTo(graphRight, centerY);
    ctx.stroke();

    // Horizontal limit lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.moveTo(graphLeft, centerY - amplitude);
    ctx.lineTo(graphRight, centerY - amplitude);
    ctx.moveTo(graphLeft, centerY + amplitude);
    ctx.lineTo(graphRight, centerY + amplitude);
    ctx.stroke();

    // Grid vertical lines (every 1 second)
    ctx.beginPath();
    for (let s = 0; s <= duration; s++) {
      const gx = graphLeft + (s / duration) * graphWidth;
      ctx.moveTo(gx, centerY - amplitude - 10);
      ctx.lineTo(gx, centerY + amplitude + 10);
    }
    ctx.stroke();

    // 2. Draw support ceiling
    ctx.strokeStyle = '#8e9196';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(massX - 40, supportY);
    ctx.lineTo(massX + 40, supportY);
    ctx.stroke();

    // Draw ceiling hatch marks
    ctx.strokeStyle = 'rgba(142, 145, 150, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let h = massX - 35; h <= massX + 35; h += 10) {
      ctx.moveTo(h, supportY);
      ctx.lineTo(h - 5, supportY - 8);
    }
    ctx.stroke();

    // 3. Draw Spring
    ctx.strokeStyle = '#db0042'; // Brand color spring
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Spring starts at (massX, supportY) and ends at top of mass (massX, massY - radius)
    drawSpring(ctx, massX, supportY, massX, massY - radius, 14, 12);

    // 4. Draw Mass (Circle with radial gradient)
    const grad = ctx.createRadialGradient(massX - 5, massY - 5, 2, massX, massY, radius);
    grad.addColorStop(0, '#ff477e'); // Lighter brand red
    grad.addColorStop(0.8, '#db0042'); // Primary brand red
    grad.addColorStop(1, '#8f0028'); // Dark brand red
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(massX, massY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Draw entire Sine Wave curve (Math representation)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let gx = graphLeft; gx <= graphRight; gx++) {
      const gt = ((gx - graphLeft) / graphWidth) * duration;
      const gy = centerY + amplitude * Math.cos(omega * gt);
      if (gx === graphLeft) {
        ctx.moveTo(gx, gy);
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.stroke();

    // 6. Draw the traversed/active part of the Sine Wave in Brand Red
    const currentGraphX = graphLeft + (t / duration) * graphWidth;
    ctx.strokeStyle = '#db0042';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let gx = graphLeft; gx <= currentGraphX; gx++) {
      const gt = ((gx - graphLeft) / graphWidth) * duration;
      const gy = centerY + amplitude * Math.cos(omega * gt);
      if (gx === graphLeft) {
        ctx.moveTo(gx, gy);
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.stroke();

    // 7. Draw connection line from mass center to graph dot
    const currentGraphY = centerY + displacement;
    ctx.strokeStyle = 'rgba(219, 0, 66, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(massX, massY);
    ctx.lineTo(currentGraphX, currentGraphY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 8. Draw cursor dot on the wave
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#db0042';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(currentGraphX, currentGraphY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 9. Draw vertical time cursor line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(currentGraphX, centerY - amplitude - 15);
    ctx.lineTo(currentGraphX, centerY + amplitude + 15);
    ctx.stroke();

    // 10. Labels and text
    ctx.fillStyle = '#a6adbb';
    ctx.font = '10px monospace';
    
    // Support label
    ctx.fillText('Fixed Support', massX - 36, supportY - 14);
    
    // Mass label
    ctx.fillText('Mass (m)', massX + radius + 8, massY + 4);

    // Graph labels
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '11px monospace';
    ctx.fillText('Displacement x(t) = A cos(ωt)', graphLeft, centerY - amplitude - 20);
    
    ctx.fillStyle = '#a6adbb';
    ctx.fillText('t = 0s', graphLeft, centerY + amplitude + 25);
    ctx.fillText(`${duration}s`, graphRight - 15, centerY + amplitude + 25);
    ctx.fillText(`t = ${t.toFixed(2)}s`, currentGraphX - 20, centerY - amplitude - 25);
  }

  // Helper spring drawing function
  function drawSpring(
    ctx: CanvasRenderingContext2D, 
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number, 
    coils: number, 
    width: number
  ) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    const ux = dx / len;
    const uy = dy / len;
    
    const px = -uy;
    const py = ux;
    
    const numPoints = coils * 2 + 2;
    for (let i = 1; i < numPoints; i++) {
      const fraction = i / numPoints;
      const cx = startX + dx * fraction;
      const cy = startY + dy * fraction;
      
      if (i === 1 || i === numPoints - 1) {
        ctx.lineTo(cx, cy);
      } else {
        const offset = (i % 2 === 0 ? 1 : -1) * width;
        ctx.lineTo(cx + px * offset, cy + py * offset);
      }
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
</script>

<div class="oscillator-demo">
  <InteractiveSim 
    width={600} 
    height={300} 
    {render} 
    {duration} 
    {mode} 
    bind:time 
    ariaLabel="Harmonic Oscillator simulation showing a spring-mass system oscillating next to its cosine wave graph."
  >
    <!-- Controls nested inside InteractiveSim slot to keep them sticky inside the sim-card -->
    <div class="controls-panel">
      <div class="mode-tabs">
        <button 
          class:active={mode === 'scroll'} 
          on:click={() => mode = 'scroll'}
        >
          Scroll-Linked
        </button>
        <button 
          class:active={mode === 'play'} 
          on:click={() => mode = 'play'}
        >
          Auto-Play
        </button>
        <button 
          class:active={mode === 'manual'} 
          on:click={() => mode = 'manual'}
        >
          Manual Slider
        </button>
      </div>

      <div class="slider-container" class:disabled={mode !== 'manual'}>
        <label for="time-slider">Time: {time.toFixed(2)}s</label>
        <input 
          id="time-slider"
          type="range" 
          min="0" 
          max={duration} 
          step="0.01" 
          bind:value={time}
          disabled={mode !== 'manual'}
        />
      </div>
    </div>
  </InteractiveSim>
</div>

<style>
  .oscillator-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 1.5rem 0;
    box-sizing: border-box;
  }

  .controls-panel {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 600px;
    margin-top: 1rem;
    gap: 1rem;
    padding: 1rem 0 0 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    box-sizing: border-box;
  }

  .mode-tabs {
    display: flex;
    background: #1e1f21;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .mode-tabs button {
    background: transparent;
    border: none;
    color: #a6adbb;
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .mode-tabs button:hover {
    color: #ffffff;
  }

  .mode-tabs button.active {
    background: #db0042;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(219, 0, 66, 0.3);
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    justify-content: flex-end;
  }

  .slider-container label {
    font-size: 0.85rem;
    font-family: monospace;
    color: #a6adbb;
    min-width: 90px;
  }

  .slider-container input[type="range"] {
    flex-grow: 1;
    max-width: 200px;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: #1e1f21;
    outline: none;
    transition: opacity 0.2s;
  }

  .slider-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #db0042;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    transition: transform 0.1s ease;
  }

  .slider-container input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .slider-container input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: #db0042;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    transition: transform 0.1s ease;
  }

  .slider-container input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.2);
  }

  .slider-container.disabled {
    opacity: 0.5;
  }

  .slider-container.disabled input[type="range"]::-webkit-slider-thumb {
    cursor: not-allowed;
    background: #5e626a;
  }

  .slider-container.disabled input[type="range"]::-moz-range-thumb {
    cursor: not-allowed;
    background: #5e626a;
  }
</style>
