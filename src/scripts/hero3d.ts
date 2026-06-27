// Ana sayfa hero'sunun 3B arka plan sahnesi (yalnızca görsel katman).
// İçerik gerçek HTML; bu canvas dekoratiftir. WebGL başarısız olursa hero
// düz koyu zeminle düzgün görünür (canvas şeffaf, arkada).
//
// Tasarım token'ları: koyu zemin + şampanya altını aksanı (yeni palet yok).
// Performans: pixelRatio ≤ 2, mobilde azaltılmış parçacık, reduced-motion'da
// tek statik kare (RAF yok), görünüm dışı / sekme gizliyken döngü durur.
// Yaşam döngüsü: tek örnek (çift başlatma engellenir); dispose() ile WebGL
// bağlamı ve geom/materyaller serbest bırakılır (View Transitions sızıntısı yok).

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  IcosahedronGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
} from 'three';

const GOLD = 0xd9b779; // gold-500 token'ına yakın şampanya altını
const GRAY = 0xc9cdd6; // soluk açık-gri

interface HeroState {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  group: Group;
  ico: LineSegments;
  shell: LineSegments;
  raf: number | null;
  animated: boolean;
  inView: boolean;
  pageVisible: boolean;
  pointerX: number;
  pointerY: number;
  camX: number;
  camY: number;
  start: number;
  disposables: { dispose: () => void }[];
  io: IntersectionObserver | null;
  onPointer: (e: PointerEvent) => void;
  onResize: () => void;
  onVisibility: () => void;
}

let state: HeroState | null = null;

/** Küre kabuğunda rastgele dağılmış noktalar (hafif kalınlıkla). */
function sphereShell(count: number, radius: number, spread: number): BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius + (Math.random() - 0.5) * spread;
    const s = Math.sin(phi);
    positions[i * 3] = r * s * Math.cos(theta);
    positions[i * 3 + 1] = r * s * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(positions, 3));
  return g;
}

function olcuAl(canvas: HTMLCanvasElement): { w: number; h: number } {
  return {
    w: canvas.clientWidth || window.innerWidth,
    h: canvas.clientHeight || window.innerHeight,
  };
}

export function initHero3d(canvas: HTMLCanvasElement): void {
  // Çift başlatma engeli: zaten bir sahne varsa yenisini kurma.
  if (state) return;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    // WebGL yoksa sessizce vazgeç — hero düz koyu zeminle görünür.
    return;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth <= 640;
  const animated = !reduce; // reduced-motion → tek statik kare

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const { w, h } = olcuAl(canvas);
  renderer.setSize(w, h, false);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 5);

  const group = new Group();
  scene.add(group);

  // Parçacık alanı — mobilde belirgin azaltılır.
  const goldN = mobile ? 220 : 700;
  const grayN = mobile ? 140 : 450;
  const goldGeo = sphereShell(goldN, 2.1, 0.5);
  const grayGeo = sphereShell(grayN, 2.4, 0.6);
  const goldMat = new PointsMaterial({ color: GOLD, size: 0.02, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false });
  const grayMat = new PointsMaterial({ color: GRAY, size: 0.016, sizeAttenuation: true, transparent: true, opacity: 0.35, depthWrite: false });
  group.add(new Points(goldGeo, goldMat));
  group.add(new Points(grayGeo, grayMat));

  // Tel kafes ikosahedron + dış kabuk.
  const icoBase = new IcosahedronGeometry(1.25, 1);
  const icoWire = new WireframeGeometry(icoBase);
  const icoMat = new LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.5 });
  const ico = new LineSegments(icoWire, icoMat);
  group.add(ico);

  const shellBase = new IcosahedronGeometry(1.85, 1);
  const shellWire = new WireframeGeometry(shellBase);
  const shellMat = new LineBasicMaterial({ color: GRAY, transparent: true, opacity: 0.12 });
  const shell = new LineSegments(shellWire, shellMat);
  group.add(shell);

  // Wireframe kopyaladıktan sonra temel geometriler gereksiz.
  icoBase.dispose();
  shellBase.dispose();

  const onPointer = (e: PointerEvent) => {
    if (!state) return;
    state.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    state.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onResize = () => {
    if (!state) return;
    const { w: nw, h: nh } = olcuAl(canvas);
    state.camera.aspect = nw / nh;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(nw, nh, false);
    if (!state.animated) renderFrame(); // statik modda yeniden çiz
  };
  const onVisibility = () => {
    if (!state) return;
    state.pageVisible = !document.hidden;
    if (state.pageVisible) play();
    else pause();
  };

  state = {
    canvas, renderer, scene, camera, group, ico, shell,
    raf: null, animated, inView: true, pageVisible: !document.hidden,
    pointerX: 0, pointerY: 0, camX: 0, camY: 0, start: performance.now(),
    disposables: [goldGeo, grayGeo, goldMat, grayMat, icoWire, icoMat, shellWire, shellMat],
    io: null, onPointer, onResize, onVisibility,
  };

  // İlk kareyi hemen çiz (statik veya animasyonun 0. karesi).
  group.rotation.set(0.15, 0.4, 0);
  renderFrame();

  // Görünürlük gözlemcisi — hero ekrandan çıkınca döngüyü durdur.
  state.io = new IntersectionObserver(
    (entries) => {
      if (!state) return;
      state.inView = entries.some((en) => en.isIntersecting);
      if (state.inView) play();
      else pause();
    },
    { threshold: 0.01 },
  );
  state.io.observe(canvas);

  if (animated) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
  }
  window.addEventListener('resize', onResize, { passive: true });

  play();
}

function renderFrame(): void {
  if (!state) return;
  const { renderer, scene, camera, group, ico, shell } = state;

  if (state.animated) {
    const t = (performance.now() - state.start) / 1000;
    // İmleç parallax'ı — yumuşak lerp.
    state.camX += (state.pointerX * 0.6 - state.camX) * 0.05;
    state.camY += (-state.pointerY * 0.4 - state.camY) * 0.05;
    camera.position.x = state.camX;
    camera.position.y = state.camY;
    camera.lookAt(0, 0, 0);
    // Yavaş dönme.
    group.rotation.y = t * 0.08;
    group.rotation.x = 0.15 + Math.sin(t * 0.15) * 0.1;
    // Hafif nabız (sin tabanlı ölçek).
    const pulse = 1 + Math.sin(t * 0.8) * 0.03;
    ico.scale.setScalar(pulse);
    shell.scale.setScalar(pulse);
  }

  renderer.render(scene, camera);
}

function loop(): void {
  if (!state) return;
  renderFrame();
  state.raf = requestAnimationFrame(loop);
}

function play(): void {
  if (!state || !state.animated) return;
  if (state.raf == null && state.inView && state.pageVisible) {
    state.raf = requestAnimationFrame(loop);
  }
}

function pause(): void {
  if (!state || state.raf == null) return;
  cancelAnimationFrame(state.raf);
  state.raf = null;
}

export function disposeHero3d(): void {
  if (!state) return;
  const s = state;
  state = null; // önce null'la ki listener'lar erken çıksın

  if (s.raf != null) cancelAnimationFrame(s.raf);
  if (s.io) s.io.disconnect();
  window.removeEventListener('pointermove', s.onPointer);
  window.removeEventListener('resize', s.onResize);
  document.removeEventListener('visibilitychange', s.onVisibility);

  for (const d of s.disposables) d.dispose();
  s.renderer.dispose();
  // WebGL bağlamını zorla bırak (View Transitions'ta context sızıntısını önle).
  s.renderer.forceContextLoss();
}
