import type * as T from 'three';

/**
 * Ambiente del teclado: cuarto oscuro con una luz azulada, parpadeante, que viene de detrás
 * (la misma que antes salía del monitor) y es lo único que ilumina las teclas.
 */
export function crearEntorno({ THREE }: { THREE: typeof T }) {
  const grupo = new THREE.Group();
  const luz = new THREE.PointLight(0x8fb8ff, 650, 0, 2);
  luz.position.set(0, 7.2, -5.2);
  grupo.add(luz);
  return {
    grupo,
    tick: (t: number) => {
      const f = 0.75 + 0.25 * Math.sin(t * 31) * Math.sin(t * 7.3) + (Math.random() - 0.5) * 0.15;
      luz.intensity = 650 * f;
    },
  };
}
