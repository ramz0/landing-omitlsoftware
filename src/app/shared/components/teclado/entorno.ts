import type * as T from 'three';

/**
 * Ambiente del teclado: cuarto oscuro con una luz jade, parpadeante, que viene de detrás
 * (la misma que antes salía del monitor), más dos luces ámbar bajas a los costados que dibujan el borde
 * de cada tecla (contraste cálido sobre el jade).
 */
export function crearEntorno({ THREE }: { THREE: typeof T }) {
  const grupo = new THREE.Group();
  const luz = new THREE.PointLight(0x5fd0c8, 650, 0, 2);
  luz.position.set(0, 7.2, -5.2);
  grupo.add(luz);
  for (const x of [-9, 9]) {
    const borde = new THREE.PointLight(0xf3c649, 45, 0, 2);
    borde.position.set(x, 1.8, 5);
    grupo.add(borde);
  }
  return {
    grupo,
    tick: (t: number) => {
      const f = 0.75 + 0.25 * Math.sin(t * 31) * Math.sin(t * 7.3) + (Math.random() - 0.5) * 0.15;
      luz.intensity = 650 * f;
    },
  };
}
