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

const q = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
/** Redacción en el correo web (pestaña nueva), para quien no tiene una app de correo configurada en la compu. */
export const WEBMAIL = [
  { id: 'gmail', nombre: 'Gmail', url: (s: string, b: string) => `https://mail.google.com/mail/?${q({ view: 'cm', fs: '1', to: CONTACTO.email, su: s, body: b })}` },
  { id: 'outlook', nombre: 'Outlook', url: (s: string, b: string) => `https://outlook.live.com/mail/0/deeplink/compose?${q({ to: CONTACTO.email, subject: s, body: b })}` },
  { id: 'yahoo', nombre: 'Yahoo', url: (s: string, b: string) => `https://compose.mail.yahoo.com/?${q({ to: CONTACTO.email, subj: s, body: b })}` },
];
