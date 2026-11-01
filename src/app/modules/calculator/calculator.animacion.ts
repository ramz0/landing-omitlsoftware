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
