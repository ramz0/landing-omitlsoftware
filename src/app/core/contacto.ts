import { NombreIcono } from '@models/icono.model';

/** Canales de contacto de la empresa: un solo lugar. Lo que esté vacío no se muestra en ningún sitio. */
export const CONTACTO = {
  email: 'contacto@omitlsoftware.com.mx',
  /** WhatsApp con lada de país y sin signos (52…). */
  whatsapp: '',
  redes: [
    { nombre: 'Instagram', icono: 'instagram' as NombreIcono, url: '' },
    { nombre: 'LinkedIn', icono: 'linkedin' as NombreIcono, url: '' },
  ],
};

export const linkWhatsapp = (texto: string) => `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(texto)}`;
export const linkCorreo = (asunto: string, cuerpo = '') =>
  `mailto:${CONTACTO.email}?subject=${encodeURIComponent(asunto)}${cuerpo ? '&body=' + encodeURIComponent(cuerpo) : ''}`;
