import type { Tecnologia } from '@models/proyecto.model';
import { PATHS } from '@shared/components/icono/icono';
import { crearEntorno } from './entorno';

export interface TeclaEscena {
  /** Ancho en cuartos de unidad (4 = tecla normal). */
  ancho: number;
  tec: Tecnologia | null;
}

export interface OpcionesEscena {
  contenedor: HTMLElement;
  filas: TeclaEscena[][];
  /** Se llama al presionar la tecla de una tecnología (clic, toque o letra del teclado). */
  alSeleccionar: (t: Tecnologia) => void;
  /** Tecnología cuya información se proyecta sobre la mesa. */
  activa: () => Tecnologia | null;
  /** Avance del scroll, 0 → 1 (las letras del teclado real solo responden con el teclado a la vista). */
  progreso: () => number;
}

const PASO = 1;
const GAP = 0.08;
const ALTO_TECLA = 0.62;
const PROFUNDIDAD = 0.24;
/** Fondo de mesa (en unidades) reservado detrás del teclado para el icono y el texto. */
const ZONA_INFO = 4;
const MESA_Y = -0.95;

/** Teclado 3D con three.js. Se importa de forma diferida para no engordar el bundle inicial. */
export async function crearEscena(op: OpcionesEscena) {
  const THREE = await import('three');
  const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
  const { mergeVertices } = await import('three/examples/jsm/utils/BufferGeometryUtils.js');

  type Geo = InstanceType<typeof THREE.BufferGeometry>;
  const { contenedor, filas } = op;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  contenedor.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  // Luz de entorno de estudio: da reflejos suaves en la carcasa y volumen al plástico mate.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.08;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0x5fb3b2, 0x030606, 0.18));
  const sol = new THREE.DirectionalLight(0x6fc4bc, 0.25);
  sol.position.set(-4, 12, 7);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, near: 1, far: 50 });
  sol.shadow.radius = 4;
  scene.add(sol);
  // El teclado va adelante y detrás queda la mesa libre para la información.
  const anchoTotal = 15 * PASO;
  const largoTotal = filas.length * PASO;
  const mundo = new THREE.Group();
  mundo.position.z = ZONA_INFO / 2;
  scene.add(mundo);
  const brillo = new THREE.PointLight(0xf3c649, 0, 4, 2);
  mundo.add(brillo);

  // Carcasa y placa
  const negro = new THREE.MeshStandardMaterial({ color: 0x07100f, roughness: 0.9, metalness: 0 });
  const carcasa = new THREE.Mesh(new RoundedBoxGeometry(anchoTotal + 1, 0.9, largoTotal + 1, 3, 0.08), negro);
  carcasa.position.y = -0.45 - 0.05;
  carcasa.receiveShadow = true;
  mundo.add(carcasa);
  const placa = new THREE.Mesh(
    new THREE.PlaneGeometry(anchoTotal + 0.3, largoTotal + 0.3),
    new THREE.MeshStandardMaterial({ color: 0x030808, roughness: 0.9 }),
  );
  placa.rotation.x = -Math.PI / 2;
  placa.position.y = 0.002;
  placa.receiveShadow = true;
  mundo.add(placa);

  // Keycap: caja redondeada con la cara superior más angosta (perfil alto tipo cherry).
  const geos = new Map<number, Geo>();
  const keycap = (ancho: number): Geo => {
    const g = geos.get(ancho);
    if (g) return g;
    const w = (ancho / 4) * PASO - GAP;
    const d = PASO - GAP;
    let base = new RoundedBoxGeometry(w, ALTO_TECLA, d, 3, 0.035) as unknown as Geo;
    base.deleteAttribute('normal');
    base.deleteAttribute('uv');
    base = mergeVertices(base as never) as unknown as Geo;
    const p = base.attributes['position'] as InstanceType<typeof THREE.BufferAttribute>;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + ALTO_TECLA / 2) / ALTO_TECLA;
      p.setX(i, p.getX(i) * (1 - 0.2 * t));
      p.setZ(i, p.getZ(i) * (1 - 0.3 * t));
      // Cara superior cóncava (cilíndrica) como en un keycap real.
      if (t > 0.98) {
        const hw = (w / 2) * 0.8;
        p.setY(i, p.getY(i) - 0.03 * (1 - Math.min(1, (p.getX(i) / hw) ** 2)));
      }
    }
    base.computeVertexNormals();
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = (p.getX(i) + p.getZ(i) * 0.7) * 5;
      uv[i * 2 + 1] = (p.getY(i) + p.getZ(i) * 0.4) * 5;
    }
    base.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    base.translate(0, ALTO_TECLA / 2, 0);
    geos.set(ancho, base);
    return base;
  };
  // Grano muy fino del plástico (bump).
  const ruido = document.createElement('canvas');
  ruido.width = ruido.height = 128;
  const rc = ruido.getContext('2d')!;
  const img = rc.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 165;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  rc.putImageData(img, 0, 0);
  const grano = new THREE.CanvasTexture(ruido);
  grano.wrapS = grano.wrapT = THREE.RepeatWrapping;
  // Negro mate: sin barniz ni brillo, solo un grano fino.
  const matTecla = new THREE.MeshStandardMaterial({
    color: 0x1f3d39,
    roughness: 0.92,
    metalness: 0,
    bumpMap: grano,
    bumpScale: 0.5,
  });

  const textura = (nombre: Tecnologia['icono']) => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    if (nombre) {
      const { vb, d } = PATHS[nombre];
      const [, , w, h] = vb.split(' ').map(Number);
      const k = 200 / Math.max(w, h);
      ctx.translate(128 - (w * k) / 2, 128 - (h * k) / 2);
      ctx.scale(k, k);
      ctx.fillStyle = '#fff';
      ctx.fill(new Path2D(d));
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  const tactil = matchMedia('(pointer: coarse)').matches;
  const atajos = new Map<string, Key>();
  const textoTextura = (txt: string) => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.font = '700 84px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt.toUpperCase(), 64, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  interface Key {
    grupo: InstanceType<typeof THREE.Group>;
    tec: Tecnologia | null;
    icono?: InstanceType<typeof THREE.MeshBasicMaterial>;
    prof: number;
    /** Mantenida con doble clic (o toque en móvil). */
    sostenida: boolean;
    /** Mientras el puntero está abajo. */
    momentanea: boolean;
    /** Mientras su letra está abajo en el teclado real. */
    teclado: boolean;
    entrada: number;
    retardo: number;
  }
  const keys: Key[] = [];
  const meshes: InstanceType<typeof THREE.Mesh>[] = [];
  let ordenTec = 0;
  const planos: InstanceType<typeof THREE.Mesh>[] = [];

  filas.forEach((fila, f) => {
    let x = 0;
    fila.forEach((k) => {
      const ancho = (k.ancho / 4) * PASO;
      const grupo = new THREE.Group();
      grupo.position.set(-anchoTotal / 2 + x + ancho / 2, 0, -largoTotal / 2 + f * PASO + PASO / 2);
      x += ancho;
      const mesh = new THREE.Mesh(keycap(k.ancho) as never, matTecla);
      mesh.castShadow = mesh.receiveShadow = true;
      grupo.add(mesh);
      const key: Key = { grupo, tec: k.tec, prof: 0, sostenida: false, momentanea: false, teclado: false, entrada: 1, retardo: 0 };
      mesh.userData['key'] = key;
      if (k.tec?.icono) {
        const mat = new THREE.MeshBasicMaterial({ map: textura(k.tec.icono), transparent: true, color: 0xd0d0d4 });
        const lado = (PASO - GAP) * 0.62;
        const plano = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado), mat);
        plano.rotation.x = -Math.PI / 2;
        plano.position.y = ALTO_TECLA + 0.004;
        planos.push(plano);
        grupo.add(plano);
        key.icono = mat;
        if (k.tec.atajo && !tactil) {
          const leyenda = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.3),
            new THREE.MeshBasicMaterial({ map: textoTextura(k.tec.atajo), transparent: true, color: 0xb4b4ba, depthWrite: false }),
          );
          // Cara frontal inclinada del keycap (la cara superior es 0.3 más angosta en z).
          const inclina = Math.atan(((PASO - GAP) * 0.15) / ALTO_TECLA);
          leyenda.rotation.x = -inclina;
          leyenda.position.set(0, 0.22, (PASO - GAP) / 2 - (0.22 / ALTO_TECLA) * (PASO - GAP) * 0.15 + 0.006);
          grupo.add(leyenda);
          atajos.set(k.tec.atajo.toLowerCase(), key);
        }
        key.retardo = ordenTec++ * 0.07;
        key.entrada = 0;
      }
      meshes.push(mesh);
      keys.push(key);
      mundo.add(grupo);
    });
  });

  // Mesa: plano grande que se desvanece en los bordes y recibe las sombras.
  const mesaTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, 'rgba(26,26,30,1)');
    g.addColorStop(0.55, 'rgba(18,18,21,0.9)');
    g.addColorStop(1, 'rgba(10,10,12,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const mesa = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 30),
    new THREE.MeshStandardMaterial({ map: mesaTex, transparent: true, depthWrite: false, roughness: 1, metalness: 0 }),
  );
  mesa.rotation.x = -Math.PI / 2;
  mesa.position.y = MESA_Y - 0.002;
  mesa.receiveShadow = true;
  mesa.renderOrder = -1; // transparente: debe dibujarse antes que el texto para no atenuarlo
  scene.add(mesa);

  // Monitor flotante detrás del teclado.
  const entorno = crearEntorno({ THREE });
  scene.add(entorno.grupo);

  // Información sobre la mesa: el logo de la tecnología como holograma ámbar (con reflejo) y su texto "impreso".
  const centroInfo = -(largoTotal + 1) / 2 - 0.35;
  const AMBAR = '#f3c649';
  const POS_X = -5.6;

  // El logo se dibuja en un lienzo (trazo + brillo) y va en un plano que flota sobre la mesa.
  const LADO = 3.8;
  const TEX = 640;
  const decales = new Map<string, InstanceType<typeof THREE.CanvasTexture>>();
  const decalIcono = (nombre: NonNullable<Tecnologia['icono']>) => {
    let t = decales.get(nombre);
    if (t) return t;
    const { vb, d } = PATHS[nombre];
    const [x0, y0, w, h] = vb.split(' ').map(Number);
    const cv = document.createElement('canvas');
    cv.width = cv.height = TEX;
    const c = cv.getContext('2d')!;
    const p = new Path2D(d);
    const k = (0.9 * TEX) / Math.max(w, h);
    c.translate(TEX / 2 - k * (x0 + w / 2), TEX / 2 - k * (y0 + h / 2));
    c.scale(k, k);
    c.lineJoin = 'round';
    // shadowBlur va en píxeles de lienzo (no escala con la transformación); lineWidth sí, de ahí el /k.
    c.fillStyle = 'rgba(243,198,73,0.10)';
    c.fill(p);
    c.shadowColor = AMBAR;
    c.shadowBlur = 40;
    c.strokeStyle = AMBAR;
    c.lineWidth = 2 / k;
    c.stroke(p);
    c.shadowBlur = 14;
    c.strokeStyle = '#ffe9a8';
    c.lineWidth = 3 / k;
    c.stroke(p);
    t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    decales.set(nombre, t);
    return t;
  };
  const matDecal = () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, opacity: 0, blending: THREE.AdditiveBlending });
  const hacerPlano = (mat: InstanceType<typeof THREE.MeshBasicMaterial>) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(LADO, LADO), mat);
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 1;
    m.visible = false;
    scene.add(m);
    return m;
  };
  const matHolo = matDecal();
  const matReflejo = matDecal();
  const plano = hacerPlano(matHolo);
  const reflejo = hacerPlano(matReflejo); // se refleja en la mesa, más tenue
  const TEX_W = 2000;
  const TEX_H = 640;
  const textoInfo = (titulo: string, cuerpo: string, vacio: boolean) => {
    const c = document.createElement('canvas');
    c.width = TEX_W;
    c.height = TEX_H;
    const ctx = c.getContext('2d')!;
    ctx.textBaseline = 'top';
    if (!vacio) {
      ctx.fillStyle = '#f3c649';
      ctx.font = '800 150px system-ui, sans-serif';
      ctx.fillText(titulo, 0, 20);
    }
    ctx.fillStyle = vacio ? 'rgba(220,220,226,0.55)' : 'rgba(228,228,232,0.9)';
    ctx.font = `500 ${vacio ? 70 : 72}px system-ui, sans-serif`;
    const palabras = cuerpo.split(' ');
    let linea = '';
    let y = vacio ? 140 : 215;
    for (const w of palabras) {
      const prueba = linea ? `${linea} ${w}` : w;
      if (ctx.measureText(prueba).width > TEX_W && linea) {
        ctx.fillText(linea, 0, y);
        linea = w;
        y += 92;
      } else linea = prueba;
    }
    ctx.fillText(linea, 0, y);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const AYUDA = 'Presiona una tecla para ver cómo usamos cada tecnología.';
  const matTexto = new THREE.MeshBasicMaterial({ map: textoInfo('', AYUDA, true), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const planoTexto = new THREE.Mesh(new THREE.PlaneGeometry(9.2, (9.2 * TEX_H) / TEX_W), matTexto);
  planoTexto.rotation.x = -Math.PI / 2;
  planoTexto.position.set(-2.6 + 4.8, MESA_Y + 0.01, centroInfo);
  planoTexto.renderOrder = 2;
  scene.add(planoTexto);
  let mostrada: Tecnologia | null | undefined;
  let emerge = 1;
  let opTexto = 0;

  // Cámara: encuadra el teclado.
  let inclinacion = THREE.MathUtils.degToRad(52);
  let retrato = false;
  let angosto = false; // el texto va en HTML (.info), no impreso en la mesa
  let hayIcono = false;
  const poseB = { pos: new THREE.Vector3(), mira: new THREE.Vector3(0, 0, 0) };
  const ajustar = () => {
    const w = contenedor.clientWidth || 1;
    const h = contenedor.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    // Teclado: lo más ancho posible; si el contenedor es muy bajo manda el alto.
    // En pantallas verticales (móvil) el teclado se gira 90° y se ve casi desde arriba: así ocupa el alto
    // de la pantalla y las teclas quedan del doble de tamaño. La información va en el texto HTML.
    retrato = false; // ponytail: girar el teclado en vertical se veía raro; se queda horizontal y se ajusta al ancho
    angosto = w < 700;
    mundo.rotation.y = retrato ? Math.PI / 2 : 0;
    mundo.position.z = retrato ? 0 : ZONA_INFO / 2;
    planos.forEach((p) => (p.rotation.z = retrato ? -Math.PI / 2 : 0)); // los iconos siguen legibles
    inclinacion = THREE.MathUtils.degToRad(retrato ? 70 : 52);
    const ancho3d = retrato ? largoTotal + 1 : anchoTotal;
    const alto3d = retrato ? anchoTotal + 1 : largoTotal + 1 + ZONA_INFO;
    const alAncho = (ancho3d + 0.8) / 2 / Math.tan(hfov / 2);
    const alAlto = (alto3d * Math.sin(inclinacion) + 1.4) / 2 / Math.tan(vfov / 2);
    const dist = Math.max(alAncho * (retrato ? 1.05 : 1.2), alAlto * 1.05);
    poseB.pos.set(0, Math.sin(inclinacion) * dist, Math.cos(inclinacion) * dist);
    poseB.mira.set(0, 0, retrato ? -1.8 : 0); // en vertical baja el teclado para dejar libre el título
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(ajustar);
  ro.observe(contenedor);
  ajustar();

  // Interacción
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let hover: Key | null = null;
  const golpe = (e: MouseEvent): Key | null => {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? (hit.object.userData['key'] as Key) : null;
  };
  const el = renderer.domElement;
  const onMove = (e: PointerEvent) => {
    hover = golpe(e);
    el.style.cursor = hover?.tec ? 'pointer' : 'default';
  };
  // Clic: la tecla baja mientras se mantiene. Doble clic la deja presionada (en táctil, un toque alterna).
  const onDown = (e: PointerEvent) => {
    const k = golpe(e);
    if (!k) return;
    k.momentanea = true; // igual que con mouse: baja mientras se toca y sube al soltar, también en táctil
    if (k.tec) op.alSeleccionar(k.tec);
  };
  const onDbl = (e: MouseEvent) => {
    const k = golpe(e);
    if (k?.tec && !tactil) k.sostenida = !k.sostenida;
  };
  const soltar = () => keys.forEach((k) => (k.momentanea = false));
  const onLeave = () => {
    hover = null;
    soltar();
  };
  // Letras del teclado real (solo con puntero fino y mientras el teclado está a la vista).
  const onKeyDown = (e: KeyboardEvent) => {
    if (!activo || op.progreso() < 0.6 || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = atajos.get(e.key.toLowerCase());
    if (!k?.tec) return;
    k.teclado = true;
    op.alSeleccionar(k.tec);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = atajos.get(e.key.toLowerCase());
    if (k) k.teclado = false;
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('dblclick', onDbl);
  el.addEventListener('pointerup', soltar);
  el.addEventListener('pointercancel', soltar); // un gesto de scroll cancela el toque: sin esto la tecla se queda hundida
  el.addEventListener('pointerleave', onLeave);
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);

  // Bucle de render (se pausa fuera de pantalla)
  let activo = false;
  const reloj = new THREE.Clock();
  let t = 0;
  const tick = () => {
    const dt = Math.min(reloj.getDelta(), 0.05);
    t += dt;
    let luz = 0;
    for (const k of keys) {
      const presionada = k.sostenida || k.momentanea || k.teclado;
      k.prof += ((presionada ? PROFUNDIDAD : 0) - k.prof) * Math.min(1, dt * 30);
      k.grupo.position.y = -k.prof;
      if (k.icono) {
        k.entrada = Math.min(1, Math.max(0, (t - k.retardo) / 0.5));
        const e = 1 - Math.pow(1 - k.entrada, 3);
        k.grupo.position.y += (1 - e) * 2.5;
        k.icono.opacity = e;
        const prendida = presionada;
        k.icono.color.setHex(prendida ? 0xf3c649 : k === hover ? 0xffe9a8 : 0xd0d0d4);
        if (prendida) {
          brillo.position.set(k.grupo.position.x, 0.9, k.grupo.position.z);
          luz = 3;
        }
      }
    }
    brillo.intensity += (luz - brillo.intensity) * Math.min(1, dt * 10);

    // Información en la mesa: el icono emerge y el texto se imprime al cambiar de tecnología.
    const sel = op.activa();
    if (sel !== mostrada) {
      mostrada = sel;
      matTexto.map?.dispose();
      matTexto.map = textoInfo(sel?.nombre ?? '', sel ? (sel.uso ?? '') : AYUDA, !sel);
      matTexto.needsUpdate = true;
      hayIcono = !!sel?.icono;
      if (sel?.icono) {
        matHolo.map = matReflejo.map = decalIcono(sel.icono);
        matHolo.needsUpdate = matReflejo.needsUpdate = true;
      }
      emerge = 0;
      opTexto = 0;
    }
    emerge = Math.min(1, emerge + dt * 2.2);
    const seg = performance.now() / 1000;
    plano.visible = reflejo.visible = hayIcono && !angosto;
    const flota = 0.3 + Math.sin(seg * 1.6) * 0.04;
    plano.position.set(POS_X + 0.4, MESA_Y + flota, centroInfo);
    reflejo.position.set(POS_X + 0.4, MESA_Y - flota * 0.6, centroInfo);
    matHolo.opacity = emerge * (0.9 + 0.1 * Math.sin(seg * 30) * Math.sin(seg * 7.1));
    matReflejo.opacity = matHolo.opacity * 0.22;
    planoTexto.visible = !angosto;
    opTexto = Math.min(1, opTexto + dt * 3);
    matTexto.opacity = opTexto;
    entorno.tick(performance.now() / 1000);
    camera.position.copy(poseB.pos);
    camera.lookAt(poseB.mira);
    renderer.render(scene, camera);
  };

  const io = new IntersectionObserver(([e]) => {
    const visible = e.isIntersecting;
    if (visible === activo) return;
    activo = visible;
    renderer.setAnimationLoop(visible ? tick : null);
  });
  io.observe(contenedor);

  return () => {
    io.disconnect();
    ro.disconnect();
    renderer.setAnimationLoop(null);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('dblclick', onDbl);
    removeEventListener('keydown', onKeyDown);
    removeEventListener('keyup', onKeyUp);
    el.removeEventListener('pointerup', soltar);
  el.removeEventListener('pointercancel', soltar);
    el.removeEventListener('pointerleave', onLeave);
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const m = o.material as InstanceType<typeof THREE.Material> & { map?: { dispose(): void } };
        m.map?.dispose();
        m.dispose();
      }
    });
    renderer.dispose();
    el.remove();
  };
}
