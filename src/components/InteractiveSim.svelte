<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let width = 600;
  export let height = 300;
  export let duration = 10;
  export let mode: 'play' | 'scroll' | 'manual' = 'play';
  export let time = 0;
  export let type: 'canvas' | 'svg' = 'canvas';
  export let ariaLabel = "Interactive physics simulation";
  
  // The render function passed from parent
  export let render: (ctx: CanvasRenderingContext2D | SVGElement, time: number) => void;

  let containerRef: HTMLDivElement;
  let canvasRef: HTMLCanvasElement;
  let svgRef: SVGElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  let lastTimestamp = 0;
  let listenersAdded = false;

  // Set up device pixel ratio for canvas crispness
  function setupCanvas() {
    if (type !== 'canvas' || !canvasRef) return;
    ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvasRef.width = width * dpr;
    canvasRef.height = height * dpr;
    canvasRef.style.width = `${width}px`;
    canvasRef.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }

  // Draw current state
  function draw() {
    if (type === 'canvas' && canvasRef && ctx) {
      ctx.clearRect(0, 0, width, height);
      render(ctx, time);
    } else if (type === 'svg' && svgRef) {
      render(svgRef, time);
    }
  }

  // Reactive updates when time changes
  $: if (time !== undefined && (canvasRef || svgRef)) {
    draw();
  }

  // Setup canvas size whenever width/height changes
  $: if ((width || height) && canvasRef) {
    setupCanvas();
    draw();
  }

  // Play Mode Animation Loop
  function tick(timestamp: number) {
    if (mode !== 'play') return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    time = (time + delta) % duration;
    animationFrameId = requestAnimationFrame(tick);
  }

  // Scroll Mode: track element position within viewport (no extra container needed)
  function handleScroll() {
    if (mode !== 'scroll' || !containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Progress: 0 when element top reaches viewport bottom,
    //           1 when element bottom reaches viewport top.
    // This gives a smooth full scrub as you scroll past the element.
    let progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    progress = Math.max(0, Math.min(1, progress));
    time = progress * duration;
  }

  function addScrollListeners() {
    if (typeof window === 'undefined' || listenersAdded) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    listenersAdded = true;
  }

  function removeScrollListeners() {
    if (typeof window === 'undefined' || !listenersAdded) return;
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
    listenersAdded = false;
  }

  // Reactive mode transitions
  $: if (mode === 'play') {
    lastTimestamp = 0;
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
    }
    removeScrollListeners();
  } else {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(animationFrameId);
    }
    if (mode === 'scroll') {
      addScrollListeners();
      handleScroll();
    } else {
      removeScrollListeners();
    }
  }

  onMount(() => {
    if (type === 'canvas') {
      setupCanvas();
    }
    
    if (mode === 'play') {
      lastTimestamp = 0;
      animationFrameId = requestAnimationFrame(tick);
    } else if (mode === 'scroll') {
      handleScroll();
      addScrollListeners();
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(animationFrameId);
      removeScrollListeners();
    }
  });
</script>

<style>
  .sim-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1.5rem 0;
  }

  .sim-card {
    background: #252629;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 632px;
    box-sizing: border-box;
  }

  canvas, svg {
    max-width: 100%;
    height: auto;
    display: block;
    background: transparent;
  }

  .fallback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #252629;
    border-radius: 12px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }
</style>

<!-- Same layout for all modes: card sits inline, no tall container or sticky positioning -->
<div bind:this={containerRef} class="sim-container">
  <div class="sim-card">
    {#if type === 'canvas'}
      <canvas 
        bind:this={canvasRef} 
        role="img" 
        aria-label={ariaLabel}
      ></canvas>
    {:else}
      <svg 
        bind:this={svgRef} 
        width={width} 
        height={height} 
        role="img" 
        aria-label={ariaLabel}
      ></svg>
    {/if}
    <slot></slot>
  </div>
  <noscript>
    <div class="fallback-container" style:width="{width}px" style:height="{height}px">
      <slot name="fallback">
        <p style="color: #ccc; font-family: sans-serif; text-align: center; padding: 1rem;">
          JavaScript is required to view this interactive simulation.
        </p>
      </slot>
    </div>
  </noscript>
</div>
