import gsap from 'gsap';

const CONFETI = ['#045453', '#f3c649', '#90c6c5', '#2a9d8f', '#f5e8bc'];

/** Cuadritos de pixel que salen disparados desde (x, y) de la ventana y caen. Se limpian solos. */
function confeti(x: number, y: number, n = 70) {
  for (let i = 0; i < n; i++) {
    const s = 5 + Math.random() * 6;
    const c = document.createElement('div');
    Object.assign(c.style, { position: 'fixed', left: `${x}px`, top: `${y}px`, width: `${s}px`, height: `${s}px`, background: CONFETI[i % CONFETI.length], borderRadius: '1px', pointerEvents: 'none', zIndex: '60' });
    document.body.appendChild(c);
    const ang = Math.random() * Math.PI * 2;
    const v = 90 + Math.random() * 190;
    gsap.timeline({ onComplete: () => c.remove() })
      .to(c, { x: Math.cos(ang) * v, y: Math.sin(ang) * v - 80, rotation: Math.random() * 540, duration: 0.7, ease: 'power2.out' })
      .to(c, { y: '+=220', opacity: 0, duration: 1.1, ease: 'power1.in' }, '>-0.1');
  }
}

/**
 * Los pixeles de la barra se sueltan, vuelan y arman el ícono del servicio; estalla el confeti y el
 * resto de la propuesta aparece. `icono` ya contiene sus celdas (ocultas): son el destino de cada vuelo.
 */
export function revelar(barra: HTMLElement, icono: HTMLElement, resto: HTMLElement[]): gsap.core.Timeline {
  const celdas = [...barra.children] as HTMLElement[];
  const destinos = [...icono.querySelectorAll<HTMLElement>('i.on, i.y')];
  const tl = gsap.timeline();
  const volando = destinos.map((d, k) => {
    const o = celdas[k % celdas.length].getBoundingClientRect();
    const f = document.createElement('div');
    Object.assign(f.style, { position: 'fixed', left: `${o.left}px`, top: `${o.top}px`, width: `${o.width}px`, height: `${o.height}px`, background: d.classList.contains('y') ? '#f3c649' : '#045453', borderRadius: '2px', zIndex: '55', pointerEvents: 'none' });
    document.body.appendChild(f);
    return f;
  });
  gsap.set(resto, { opacity: 0 });
  tl.set(celdas, { opacity: 0 })
    .to(volando, {
      left: (i) => destinos[i].getBoundingClientRect().left,
      top: (i) => destinos[i].getBoundingClientRect().top,
      width: (i) => destinos[i].getBoundingClientRect().width,
      height: (i) => destinos[i].getBoundingClientRect().height,
      rotation: () => gsap.utils.random(-360, 360),
      duration: 1,
      ease: 'back.out(1.4)',
      stagger: { each: 0.025, from: 'random' },
    })
    .to(volando, { rotation: 0, duration: 0.25 }, '>-0.1')
    .add(() => {
      gsap.set(icono, { visibility: 'visible' });
      volando.forEach((f) => f.remove());
      const r = icono.getBoundingClientRect();
      confeti(r.left + r.width / 2, r.top + r.height / 2);
    })
    .to(celdas, { opacity: 1, duration: 0.4 }, '<')
    .to(resto, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, '<0.2');
  // Si algo la interrumpe (p. ej. "Atrás"), nada se queda oculto ni volando.
  tl.eventCallback('onInterrupt', () => {
    volando.forEach((f) => f.remove());
    gsap.set([...resto, icono, ...celdas], { clearProps: 'all' });
  });
  return tl;
}

/**
 * Al elegir una respuesta: un pixel sale del botón y viaja a la celda de la barra que se enciende; mientras
 * tanto las respuestas y el título se apagan. `alTerminar` cambia de pregunta (se llama al llegar el pixel).
 */
export function salidaPregunta(btn: HTMLElement, barra: HTMLElement, titulo: HTMLElement, opciones: HTMLElement, destino: number, alTerminar: () => void) {
  const celda = barra.children[Math.min(Math.max(destino, 0), barra.children.length - 1)] as HTMLElement;
  const o = celda.getBoundingClientRect();
  const r = btn.getBoundingClientRect();
  const p = document.createElement('div');
  Object.assign(p.style, { position: 'fixed', left: `${r.left + 14}px`, top: `${r.top + r.height / 2 - 6}px`, width: '12px', height: '12px', background: '#045453', borderRadius: '2px', zIndex: '55', pointerEvents: 'none' });
  document.body.appendChild(p);
  btn.classList.add('sel');
  gsap.timeline({ onComplete: () => { p.remove(); alTerminar(); } })
    .to(btn, { scale: 0.98, duration: 0.12, yoyo: true, repeat: 1 })
    .to(p, { left: o.left, top: o.top, width: o.width, height: o.height, duration: 0.55, ease: 'power2.inOut' }, '<')
    .to(opciones.children, { opacity: 0, y: -8, duration: 0.25, stagger: 0.04 }, '<0.1')
    .to(titulo, { opacity: 0, duration: 0.2 }, '<');
}

/** La pregunta nueva: el título sube un poco y las respuestas llegan de abajo en cascada. */
export function entradaPregunta(titulo: HTMLElement, opciones: HTMLElement, alTerminar: () => void) {
  gsap.timeline({ onComplete: alTerminar })
    .fromTo(titulo, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', clearProps: 'all' })
    .fromTo(opciones.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.07, clearProps: 'all' }, '<0.1');
}
