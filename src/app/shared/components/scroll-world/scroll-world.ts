import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Escena {
  titulo: string;
  texto: string;
  color: number;
  forma: () => THREE.BufferGeometry;
}

// ponytail: escenas procedurales; cuando existan los clips de Higgsfield/Monid, reemplazar
// el canvas por un <video> y usar `progreso` para su currentTime (el scroll ya lo calcula).
const ESCENAS: Escena[] = [
  { titulo: 'Tu negocio, en línea', texto: 'Landing pages que presentan lo que haces y convierten visitas en conversaciones.', color: 0x00f0ff, forma: () => new THREE.IcosahedronGeometry(2.2, 1) },
  { titulo: 'Software a la medida', texto: 'El sistema que sostiene tu operación, hecho para cómo trabajas hoy.', color: 0xf3c649, forma: () => new THREE.BoxGeometry(3, 3, 3, 3, 3, 3) },
  { titulo: 'App móvil', texto: 'Tu equipo y tus clientes, con todo en la palma de la mano.', color: 0xff3df2, forma: () => new THREE.BoxGeometry(1.8, 3.4, 0.4, 2, 4, 1) },
  { titulo: 'Agentes de llamadas', texto: 'Softphone, grabación y análisis con IA para cada llamada.', color: 0x7dff8a, forma: () => new THREE.TorusGeometry(2, 0.5, 12, 32) },
  { titulo: 'Tienda y punto de venta', texto: 'Vende en línea y en mostrador con el mismo inventario.', color: 0xff8a3d, forma: () => new THREE.ConeGeometry(2, 3.4, 8, 4) },
  { titulo: 'Hablemos', texto: 'Cuéntanos qué proceso vive hoy en hojas de cálculo.', color: 0xb388ff, forma: () => new THREE.OctahedronGeometry(2.4, 1) },
];

const SEPARACION = 16;
/** Hasta qué avance del scroll dura el vuelo por el mundo; el resto es la cámara saliendo del monitor. */
const FIN_MUNDO = 0.72;

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

@Component({
  selector: 'app-scroll-world',
  templateUrl: './scroll-world.html',
  styleUrl: './scroll-world.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollWorld {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  escenas = ESCENAS;
  /** -1 = ya salimos del monitor (sin texto de escena). */
  actual = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => destroyRef.onDestroy(this.iniciar()));
  }

  private iniciar(): () => void {
    const canvas = this.canvas().nativeElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    // ---- Mundo neón: se renderiza a una textura que es la pantalla del televisor ----
    // En pantallas verticales (móvil) el monitor también es vertical y el mundo se compone para ese formato.
    const retrato = canvas.clientWidth < canvas.clientHeight;
    const MW = retrato ? 9 : 16;
    const MH = retrato ? 16 : 9;
    const rt = new THREE.WebGLRenderTarget(retrato ? 720 : 1280, retrato ? 1280 : 720);
    const mundo = new THREE.Scene();
    mundo.background = new THREE.Color(0x03060f);
    mundo.fog = new THREE.FogExp2(0x03060f, 0.028);
    const camMundo = new THREE.PerspectiveCamera(retrato ? 80 : 60, MW / MH, 0.1, 200);

    const objetos: THREE.Mesh[] = [];
    const puntos: THREE.Vector3[] = [new THREE.Vector3(0, 0, 14)];
    ESCENAS.forEach((e, i) => {
      const lado = i % 2 ? 1 : -1;
      const mesh = new THREE.Mesh(
        e.forma(),
        new THREE.MeshBasicMaterial({ color: e.color, wireframe: true }),
      );
      mesh.position.set(lado * (retrato ? 0.9 : 3.2), 0, -i * SEPARACION);
      mundo.add(mesh);
      objetos.push(mesh);
      puntos.push(new THREE.Vector3(retrato ? 0 : -lado * 1.2, 0.4, -i * SEPARACION + 7));
    });
    const curva = new THREE.CatmullRomCurve3(puntos);

    const estrellas = new Float32Array(1800);
    for (let i = 0; i < estrellas.length; i += 3) {
      estrellas[i] = (Math.random() - 0.5) * 70;
      estrellas[i + 1] = (Math.random() - 0.5) * 40;
      estrellas[i + 2] = 20 - Math.random() * (ESCENAS.length * SEPARACION + 40);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(estrellas, 3));
    mundo.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })));

    // ---- Sala oscura con un televisor de tubo ----
    const sala = new THREE.Scene();
    const camSala = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
    // Pantalla plana: solo muestra el mundo, sin estática ni efectos.
    const pantalla = new THREE.Mesh(
      new THREE.PlaneGeometry(MW, MH),
      new THREE.ShaderMaterial({
        uniforms: { map: { value: rt.texture } },
        vertexShader:
          'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
        fragmentShader: `
          uniform sampler2D map; varying vec2 vUv;
          void main(){
            gl_FragColor = vec4(texture2D(map, vUv).rgb, 1.);
            #include <colorspace_fragment>
          }`,
      }),
    );
    pantalla.position.z = 0.02;

    // ---- Escritorio de dev de noche (ref.: luz ambiental cálida detrás del monitor, teclado, audífonos, planta) ----
    const mat = (color: number, roughness = 0.5, metalness = 0) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const poner = <O extends THREE.Object3D>(o: O, x: number, y: number, z: number) => {
      o.position.set(x, y, z);
      sala.add(o);
      return o;
    };
    const lienzoTex = (w: number, h: number, dibujar: (c: CanvasRenderingContext2D) => void) => {
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      dibujar(cv.getContext('2d')!);
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    // Monitor: bisel negro delgado y cristal.
    const PW = MW + 0.5;
    const PH = MH + 0.5;
    poner(new THREE.Mesh(new RoundedBoxGeometry(PW, PH, 0.45, 4, 0.12), mat(0x0b0b0c, 0.55, 0.15)), 0, 0, -0.23);
    poner(new THREE.Mesh(new THREE.BoxGeometry(PW * 0.55, PH * 0.6, 0.6), mat(0x0b0b0d, 0.5)), 0, 0, -0.7);
    // Sin pie visible: el monitor descansa sobre una repisa oscura, con una tira de luz cálida debajo.
    // Dos niveles, como en la foto del hero: el monitor en una repisa alta y el teclado en el escritorio, más abajo.
    const yRep = -PH / 2 - 0.3; // repisa del monitor
    const yDesk = yRep - 3.6; // cubierta del escritorio (más baja)
    const madera = mat(0x14151a, 0.5, 0.2);
    poner(new THREE.Mesh(new RoundedBoxGeometry(26, 0.6, 7, 3, 0.15), madera), 0, yRep, 1.2);
    poner(new THREE.Mesh(new THREE.BoxGeometry(22, 0.08, 0.1), new THREE.MeshBasicMaterial({ color: 0xffc27a })), 0, yRep - 0.35, 4.6);
    poner(new THREE.Mesh(new RoundedBoxGeometry(36, 0.6, 16, 3, 0.15), madera), 0, yDesk - 0.3, 6.5);
    for (const x of [-12.7, 12.7]) {
      poner(new THREE.Mesh(new THREE.BoxGeometry(0.5, yRep - yDesk, 7), madera), x, (yRep + yDesk) / 2, 1.2);
    }
    // Teclado decorativo: el mismo 60 % ANSI negro mate del stack de tecnologías, en pequeño y sin interacción.
    const FILAS_KB = [
      [...Array(13).fill(4), 8],
      [6, ...Array(12).fill(4), 6],
      [7, ...Array(11).fill(4), 9],
      [9, ...Array(10).fill(4), 11],
      [5, 5, 5, 25, 5, 5, 5, 5],
    ];
    const ALTO_T = 0.62;
    const GAP_T = 0.08;
    const matTecla = mat(0x1a1a1e, 0.92, 0);
    const geoTecla = new Map<number, THREE.BufferGeometry>();
    const keycap = (ancho: number) => {
      let g = geoTecla.get(ancho);
      if (g) return g;
      const w = (ancho / 4) - GAP_T;
      let b: THREE.BufferGeometry = new RoundedBoxGeometry(w, ALTO_T, 1 - GAP_T, 3, 0.035);
      b.deleteAttribute('normal');
      b.deleteAttribute('uv');
      b = mergeVertices(b);
      const p = b.attributes['position'];
      for (let i = 0; i < p.count; i++) {
        const t = (p.getY(i) + ALTO_T / 2) / ALTO_T;
        p.setX(i, p.getX(i) * (1 - 0.2 * t)); // la cara superior es más angosta
        p.setZ(i, p.getZ(i) * (1 - 0.3 * t));
      }
      b.computeVertexNormals();
      b.translate(0, ALTO_T / 2, 0);
      geoTecla.set(ancho, b);
      return b;
    };
    const teclado = new THREE.Group();
    const largoKb = FILAS_KB.length;
    const carcasaKb = new THREE.Mesh(new RoundedBoxGeometry(16, 0.9, largoKb + 1, 3, 0.08), mat(0x0b0b0c, 0.9));
    carcasaKb.position.y = -0.5;
    teclado.add(carcasaKb);
    FILAS_KB.forEach((fila, f) => {
      let x = -7.5;
      fila.forEach((ancho) => {
        const k = new THREE.Mesh(keycap(ancho), matTecla);
        k.position.set(x + ancho / 8, 0, (f - (largoKb - 1) / 2));
        teclado.add(k);
        x += ancho / 4;
      });
    });
    const ESC_KB = 0.5; // "en pequeño"
    teclado.scale.setScalar(ESC_KB);
    poner(teclado, 0, yDesk + 0.95 * ESC_KB, 4);
    sala.add(pantalla);
    // Reflejo diagonal tenue sobre el cristal.
    poner(
      new THREE.Mesh(
        new THREE.PlaneGeometry(MW, MH),
        new THREE.MeshBasicMaterial({
          map: lienzoTex(256, 256, (c) => {
            const g = c.createLinearGradient(0, 0, 256, 256);
            g.addColorStop(0, 'rgba(255,255,255,0.10)');
            g.addColorStop(0.45, 'rgba(255,255,255,0)');
            c.fillStyle = g;
            c.fillRect(0, 0, 256, 256);
          }),
          transparent: true,
          depthWrite: false,
        }),
      ),
      0,
      0,
      0.03,
    );

    // Brillo azul sobre la "mesa", como el del teclado del stack (sin escritorio ni objetos).
    const brillo = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 30),
      new THREE.MeshBasicMaterial({
        map: lienzoTex(256, 256, (c) => {
          const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
          g.addColorStop(0, 'rgba(110,160,255,0.35)');
          g.addColorStop(1, 'rgba(110,160,255,0)');
          c.fillStyle = g;
          c.fillRect(0, 0, 256, 256);
        }),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    brillo.rotation.x = -Math.PI / 2;
    poner(brillo, 0, yDesk + 0.02, 6);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: lienzoTex(256, 256, (c) => {
          const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
          g.addColorStop(0, 'rgba(190,215,255,0.75)');
          g.addColorStop(0.5, 'rgba(100,140,230,0.22)');
          g.addColorStop(1, 'rgba(60,90,200,0)');
          c.fillStyle = g;
          c.fillRect(0, 0, 256, 256);
        }),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.scale.set(MW * 2.3, MH * 2.9, 1);
    poner(halo, 0, 0, -1.5);
    // Luces: la misma azulada y parpadeante del stack, desde detrás, más una frontal tenue para el bisel.
    const luz = new THREE.PointLight(0x8fb8ff, 650, 0, 2);
    luz.position.set(0, 7.2, -5.2);
    const frontal = new THREE.PointLight(0x8fb8ff, 220, 0, 2);
    frontal.position.set(0, 2, 14);
    sala.add(luz, frontal, new THREE.AmbientLight(0x0a0f1e, 0.5));

    // ---- Scroll ----
    let objetivo = 0;
    let progreso = 0;
    const medirScroll = () => {
      const r = this.host.getBoundingClientRect();
      const total = r.height - innerHeight;
      objetivo = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    let dCerca = 20;
    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      renderer.setSize(w, h, false);
      camSala.aspect = w / h;
      camSala.updateProjectionMatrix();
      // Distancia a la que la pantalla llena el encuadre (sin ver el marco).
      const vfov = THREE.MathUtils.degToRad(camSala.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camSala.aspect);
      dCerca = Math.min((MW / 2) / Math.tan(hfov / 2), (MH / 2) / Math.tan(vfov / 2)) * 0.9;
    };
    addEventListener('scroll', medirScroll, { passive: true });
    addEventListener('resize', ajustar);
    medirScroll();
    ajustar();

    let raf = 0;
    const tick = () => {
      progreso += (objetivo - progreso) * 0.08;

      // 1) El mundo vuela dentro de la pantalla.
      const pm = Math.min(1, progreso / FIN_MUNDO);
      camMundo.position.copy(curva.getPoint(pm));
      // Mira a lo largo de la tangente: en el último punto un lookAt al siguiente punto sería degenerado.
      camMundo.lookAt(camMundo.position.clone().add(curva.getTangent(pm)));
      objetos.forEach((o, i) => {
        o.rotation.y += 0.004 * (i % 2 ? 1 : -1);
        o.rotation.x += 0.002;
      });
      renderer.setRenderTarget(rt);
      renderer.render(mundo, camMundo);
      renderer.setRenderTarget(null);

      // 2) Al final la cámara sale del monitor: se aleja y revela el monitor completo.
      const salida = suave(FIN_MUNDO - 0.08, 1, progreso);
      // Se aleja lo justo para ver el bisel del monitor, sin llegar a la base.
      // Termina ladeada y un poco baja, como en la foto del hero.
      camSala.position.set(-salida * 2.5, -salida * 2, dCerca * (1 + salida * 1.15));
      camSala.lookAt(0, -salida * 3.4, 0);
      const t = performance.now() / 1000;
      luz.intensity = 650 * (0.75 + 0.25 * Math.sin(t * 31) * Math.sin(t * 7.3));
      renderer.render(sala, camSala);

      const idx = salida > 0.15 ? -1 : Math.round(pm * (ESCENAS.length - 1));
      if (idx !== this.actual()) this.actual.set(idx);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', medirScroll);
      removeEventListener('resize', ajustar);
      [mundo, sala].forEach((sc) =>
        sc.traverse((o) => {
          if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
            o.geometry.dispose();
            (o.material as THREE.Material).dispose();
          }
        }),
      );
      rt.dispose();
      renderer.dispose();
    };
  }
}
