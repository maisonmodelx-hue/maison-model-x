// A slowly turning helix of curved photo panels. Drawn with WebGL because a true curve
// can't be made cleanly with CSS, and hand-written to avoid shipping a 3D library for it.

export type SpiralPhoto = { url: string; ratio: number };

export type SpiralOptions = {
  reducedMotion: boolean;
  onHover: (photo: number | null, x: number, y: number) => void;
  onPick: (photo: number) => void;
  onFail: () => void;
};

export type Spiral = {
  step: (direction: 1 | -1) => void;
  setPaused: (paused: boolean) => void;
  destroy: () => void;
};

const TWO_PI = Math.PI * 2;
const CAMERA_DISTANCE = 3.4; // at this distance the visible height at the helix centre is 2 units
const NEAR = 0.1;
const FAR = 12;
const COLUMNS = 24; // how finely each panel is curved
const DRIFT_SPEED = 0.05; // radians per second
const PANEL_GAP = 0.055;
const HOVER_LIFT = 0.035;
const MAX_LOADS = 3;
const IVORY = [0.949, 0.933, 0.906];
const PLACEHOLDER = new Uint8Array([230, 224, 213, 255]);

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_uv;
uniform float u_theta, u_arc, u_radius, u_height, u_rise, u_aspect;
out vec2 v_uv;
out float v_facing;
void main() {
  float angle = u_theta + (a_uv.x - 0.5) * u_arc;
  vec3 p = vec3(u_radius * sin(angle), u_rise * angle + (a_uv.y - 0.5) * u_height, u_radius * cos(angle));
  float w = ${CAMERA_DISTANCE.toFixed(1)} - p.z;
  float a = (${FAR.toFixed(1)} + ${NEAR.toFixed(1)}) / (${NEAR.toFixed(1)} - ${FAR.toFixed(1)});
  float b = 2.0 * ${FAR.toFixed(1)} * ${NEAR.toFixed(1)} / (${NEAR.toFixed(1)} - ${FAR.toFixed(1)});
  v_uv = a_uv;
  v_facing = cos(angle);
  gl_Position = vec4(p.x * ${CAMERA_DISTANCE.toFixed(1)} / u_aspect, p.y * ${CAMERA_DISTANCE.toFixed(1)}, -a * w + b, w);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_loaded, u_dim;
in vec2 v_uv;
in float v_facing;
out vec4 color;
const vec3 IVORY = vec3(${IVORY.join(", ")});
const vec3 TINT = vec3(0.902, 0.878, 0.835);
void main() {
  // The far side is seen from inside the helix, so flip it to keep photos reading correctly.
  vec2 uv = gl_FrontFacing ? v_uv : vec2(1.0 - v_uv.x, v_uv.y);
  vec3 c = mix(TINT, texture(u_image, uv).rgb, u_loaded);
  float edgeOn = 1.0 - abs(v_facing);
  c *= 1.0 - 0.22 * pow(edgeOn, 3.0);                                 // shade the curve
  c += pow(edgeOn, 6.0) * mix(vec3(0.2, 0.08, 0.02), vec3(0.04, 0.1, 0.24), v_uv.x); // soft sheen where it turns away
  c = mix(c, IVORY, smoothstep(0.1, -0.9, v_facing) * 0.34);          // the far side recedes
  color = vec4(mix(c, IVORY, u_dim), 1.0);
}`;

// Sizes are in world units, where 2 units is the height of the screen.
function shapeFor(aspect: number) {
  const radius = Math.min(aspect * 0.86, 0.95);
  const height = Math.min(Math.max(radius * 0.7, 0.26), 0.4);
  // Rows sit 2.5 panel heights apart, which leaves the far side of the helix room to show between them.
  return { radius, height, rise: (height * 2.5) / TWO_PI, visibleHalf: 1.3 + height };
}

function buildPanels(photos: SpiralPhoto[], shape: ReturnType<typeof shapeFor>) {
  const arcs = photos.map((photo) => (shape.height * photo.ratio) / shape.radius);
  const gap = PANEL_GAP / shape.radius;
  const loop = arcs.reduce((total, arc) => total + arc + gap, 0);
  // Repeat the ribbon if needed, so its loop point always stays off screen.
  const copies = Math.max(1, Math.ceil(((shape.visibleHalf * 2) / shape.rise) / loop));
  const panels: { photo: number; theta: number; arc: number }[] = [];
  let theta = -arcs[0] / 2 - gap / 2;
  for (let copy = 0; copy < copies; copy++) {
    photos.forEach((_, photo) => {
      panels.push({ photo, theta: theta + arcs[photo] / 2 + gap / 2, arc: arcs[photo] });
      theta += arcs[photo] + gap;
    });
  }
  return { panels, total: loop * copies };
}

function compile(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX_SHADER], [gl.FRAGMENT_SHADER, FRAGMENT_SHADER]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

export function createSpiral(canvas: HTMLCanvasElement, photos: SpiralPhoto[], options: SpiralOptions): Spiral | null {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
  const program = gl && compile(gl);
  if (!gl || !program) return null;

  const location = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    theta: location("u_theta"), arc: location("u_arc"), radius: location("u_radius"), height: location("u_height"),
    rise: location("u_rise"), aspect: location("u_aspect"), loaded: location("u_loaded"), dim: location("u_dim"),
  };

  const strip = new Float32Array((COLUMNS + 1) * 4);
  for (let i = 0; i <= COLUMNS; i++) strip.set([i / COLUMNS, 0, i / COLUMNS, 1], i * 4);
  const mesh = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(mesh);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, strip, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.frontFace(gl.CW); // this strip winds clockwise when seen from outside the helix
  gl.clearColor(0, 0, 0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const placeholder = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, placeholder);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, PLACEHOLDER);
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");

  const states = photos.map(() => ({ texture: null as WebGLTexture | null, requested: false, loaded: 0, lift: 0, dim: 0 }));
  const uploads: { photo: number; image: HTMLImageElement }[] = [];
  let loading = 0;

  let shape = shapeFor(1);
  let ribbon = buildPanels(photos, shape);
  let aspect = 1;
  let width = 1;
  let height = 1;

  let drift = 0;
  let speed = options.reducedMotion ? 0 : DRIFT_SPEED;
  let offset = 0;
  let targetOffset = 0;
  let paused = false;
  let hovered: number | null = null;
  let pointer: { x: number; y: number } | null = null;
  let onScreen = true;
  let raf = 0;
  let last = 0;

  const wrapped = (theta: number) => {
    const shifted = (theta + drift + offset + ribbon.total / 2) % ribbon.total;
    return (shifted < 0 ? shifted + ribbon.total : shifted) - ribbon.total / 2;
  };

  const requestPhoto = (photo: number) => {
    const state = states[photo];
    if (state.requested || loading >= MAX_LOADS) return;
    state.requested = true;
    loading++;
    const image = new Image();
    image.src = photos[photo].url;
    image.decode()
      .then(() => uploads.push({ photo, image }))
      .catch(() => {}) // the panel keeps its placeholder tint
      .finally(() => { loading--; });
  };

  const uploadOne = () => {
    const next = uploads.shift();
    if (!next) return;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, next.image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (anisotropy) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    states[next.photo].texture = texture;
  };

  // Mirrors the vertex shader, to find which panel is under the pointer (nearest wins).
  const pick = (x: number, y: number) => {
    const project = (angle: number, panelY: number) => {
      const z = shape.radius * Math.cos(angle);
      const w = CAMERA_DISTANCE - z;
      return [
        ((shape.radius * Math.sin(angle) * CAMERA_DISTANCE) / aspect / w) * 0.5 * width + width / 2,
        height / 2 - ((panelY * CAMERA_DISTANCE) / w) * 0.5 * height,
      ];
    };
    const sign = (ax: number, ay: number, bx: number, by: number) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
    const slices = 8;
    let found: number | null = null;
    let nearest = -Infinity;
    for (const panel of ribbon.panels) {
      const theta = wrapped(panel.theta);
      if (Math.abs(theta * shape.rise) > shape.visibleHalf) continue;
      const depth = Math.cos(theta);
      if (depth <= nearest) continue;
      for (let i = 0; i < slices; i++) {
        const a0 = theta + (i / slices - 0.5) * panel.arc;
        const a1 = theta + ((i + 1) / slices - 0.5) * panel.arc;
        const half = shape.height / 2;
        const corners = [project(a0, shape.rise * a0 - half), project(a1, shape.rise * a1 - half), project(a1, shape.rise * a1 + half), project(a0, shape.rise * a0 + half)];
        const sides = corners.map((c, k) => sign(c[0], c[1], corners[(k + 1) % 4][0], corners[(k + 1) % 4][1]));
        if (sides.every((s) => s >= 0) || sides.every((s) => s <= 0)) {
          found = panel.photo;
          nearest = depth;
          break;
        }
      }
    }
    return found;
  };

  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniforms.height, shape.height);
    gl.uniform1f(uniforms.rise, shape.rise);
    gl.uniform1f(uniforms.aspect, aspect);
    for (const panel of ribbon.panels) {
      const theta = wrapped(panel.theta);
      if (Math.abs(theta * shape.rise) > shape.visibleHalf) continue;
      const state = states[panel.photo];
      // Only fetch a photo once it has actually drifted onto the screen.
      const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - shape.radius * Math.cos(theta));
      if ((Math.abs(theta * shape.rise) - shape.height / 2) * scale < 1) requestPhoto(panel.photo);
      gl.bindTexture(gl.TEXTURE_2D, state.texture ?? placeholder);
      gl.uniform1f(uniforms.theta, theta);
      gl.uniform1f(uniforms.arc, panel.arc);
      gl.uniform1f(uniforms.radius, shape.radius + state.lift);
      gl.uniform1f(uniforms.loaded, state.loaded);
      gl.uniform1f(uniforms.dim, state.dim);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, (COLUMNS + 1) * 2);
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const stopped = paused || hovered !== null || options.reducedMotion;
    speed += ((stopped ? 0 : DRIFT_SPEED) - speed) * (1 - Math.exp(-dt * 3));
    drift += speed * dt;
    offset += (targetOffset - offset) * (1 - Math.exp(-dt * 5));

    if (pointer) {
      hovered = pick(pointer.x, pointer.y);
      canvas.style.cursor = hovered === null ? "" : "pointer";
      options.onHover(hovered, pointer.x, pointer.y);
    }
    const ease = 1 - Math.exp(-dt * 8);
    states.forEach((state, photo) => {
      state.loaded += ((state.texture ? 1 : 0) - state.loaded) * (1 - Math.exp(-dt * 4));
      state.lift += ((hovered === photo ? HOVER_LIFT : 0) - state.lift) * ease;
      state.dim += ((hovered !== null && hovered !== photo ? 0.45 : 0) - state.dim) * ease;
    });
    uploadOne();
    draw();
  };

  const syncRunning = () => {
    const shouldRun = onScreen && !document.hidden;
    if (shouldRun && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const resize = () => {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = width / height;
    shape = shapeFor(aspect);
    ribbon = buildPanels(photos, shape);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "mouse") pointer = { x: event.offsetX, y: event.offsetY };
  };
  const clearHover = () => {
    pointer = null;
    hovered = null;
    canvas.style.cursor = "";
    options.onHover(null, 0, 0);
  };
  const onClick = (event: MouseEvent) => {
    const photo = pick(event.offsetX, event.offsetY);
    if (photo !== null) options.onPick(photo);
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    options.onFail();
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", clearHover);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("visibilitychange", syncRunning);
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const viewport = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting; // stop drawing once the spiral has scrolled away
    syncRunning();
  });
  viewport.observe(canvas);
  resize();
  syncRunning();

  return {
    step(direction) {
      targetOffset -= direction * 0.7;
      if (options.reducedMotion) offset = targetOffset;
    },
    setPaused(value) {
      paused = value;
      if (value) clearHover();
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      resizer.disconnect();
      viewport.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", clearHover);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", syncRunning);
      states.forEach((state) => state.texture && gl.deleteTexture(state.texture));
      gl.deleteTexture(placeholder);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(mesh);
      gl.deleteProgram(program);
    },
  };
}
