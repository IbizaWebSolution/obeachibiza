// Diccionario i18n del chrome (header, burger, footer, newsletter).
// Inglés es el idioma original; el resto traduce la interfaz compartida.
// El contenido editorial de cada página (JSON de secciones) permanece en inglés.

export const locales = ['en', 'es', 'it', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Etiqueta visible en el selector de idioma */
export const localeNames: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  it: 'IT',
  fr: 'FR',
  de: 'DE',
};

const en = {
  bookABed: 'Book a bed',
  menu: 'Menu',
  close: 'Close',
  // BurgerMenu
  dayClub: 'Day Club',
  packages: 'Packages',
  celebrationPackages: 'Celebration Packages',
  bedMenus: 'Bed Menus',
  bookNow: 'Book Now',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  dubai: 'Dubai',
  music: 'Music',
  membership: 'Membership',
  merchandise: 'Merchandise',
  epsomRaces: 'Epsom Races',
  connect: 'Connect',
  aboutUs: 'About Us',
  eventsCalendar: 'Events Calendar',
  partners: 'Partners',
  workWithUs: 'Work With Us',
  accountLogin: 'Account Login',
  contactUs: 'Contact us',
  discoverBlogBurger: 'Discover our Blog',
  // Footer
  footerCta: 'We didn’t invent the pool party, we just perfected it.',
  subscribe: 'Subscribe',
  yourEmail: 'Your Email',
  newsletterDesc:
    'Keep up-to-date with island happenings in just a few shorts clicks. From Ibiza inspiration to musical motivation, we promise to bring your inbox nothing but good times.',
  newsletterOk: "Great! You're subscribed to our newsletter.",
  newsletterErr: 'Something went wrong. Please check your email address and try again.',
  locationTitle: 'Our Location (come and visit!)',
  viewMap: 'View Map',
  headlineInfo: 'Headline Info',
  supportingInfo: 'Supporting Info',
  enquiriesTitle: 'For all enquiries for reservations contact',
  myAccount: 'My Account',
  faqs: 'FAQs',
  press: 'Press',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  internalInfo: 'Internal Information',
  discoverBlog: 'Discover our blog',
  jumpIn: 'Jump In',
  copyright: '© O Beach Ibiza 2026 All rights reserved | WE ARE IN NO WAY CONNECTED TO OCEAN CLUB MARBELLA.',
};

type UiKeys = typeof en;

const es: UiKeys = {
  bookABed: 'Reserva una cama',
  menu: 'Menú',
  close: 'Cerrar',
  dayClub: 'Day Club',
  packages: 'Paquetes',
  celebrationPackages: 'Paquetes de celebración',
  bedMenus: 'Menús de camas',
  bookNow: 'Reserva ya',
  restaurant: 'Restaurante',
  hotel: 'Hotel',
  dubai: 'Dubái',
  music: 'Música',
  membership: 'Membresía',
  merchandise: 'Tienda',
  epsomRaces: 'Epsom Races',
  connect: 'Conecta',
  aboutUs: 'Sobre nosotros',
  eventsCalendar: 'Calendario de eventos',
  partners: 'Socios',
  workWithUs: 'Trabaja con nosotros',
  accountLogin: 'Acceso a tu cuenta',
  contactUs: 'Contacto',
  discoverBlogBurger: 'Descubre nuestro blog',
  footerCta: 'No inventamos la pool party, solo la perfeccionamos.',
  subscribe: 'Suscríbete',
  yourEmail: 'Tu email',
  newsletterDesc:
    'Mantente al día de lo que pasa en la isla en unos pocos clics. De la inspiración ibicenca a la motivación musical, prometemos llevar a tu bandeja de entrada solo buenos momentos.',
  newsletterOk: '¡Genial! Ya estás suscrito a nuestra newsletter.',
  newsletterErr: 'Algo ha salido mal. Comprueba tu dirección de email e inténtalo de nuevo.',
  locationTitle: 'Nuestra ubicación (¡ven a visitarnos!)',
  viewMap: 'Ver mapa',
  headlineInfo: 'Información destacada',
  supportingInfo: 'Información adicional',
  enquiriesTitle: 'Para cualquier consulta sobre reservas contacta con',
  myAccount: 'Mi cuenta',
  faqs: 'Preguntas frecuentes',
  press: 'Prensa',
  terms: 'Términos y condiciones',
  privacy: 'Política de privacidad',
  internalInfo: 'Información interna',
  discoverBlog: 'Descubre nuestro blog',
  jumpIn: 'Entra',
  copyright: '© O Beach Ibiza 2026 Todos los derechos reservados | NO TENEMOS NINGUNA RELACIÓN CON OCEAN CLUB MARBELLA.',
};

const it: UiKeys = {
  bookABed: 'Prenota un lettino',
  menu: 'Menu',
  close: 'Chiudi',
  dayClub: 'Day Club',
  packages: 'Pacchetti',
  celebrationPackages: 'Pacchetti festa',
  bedMenus: 'Menù lettini',
  bookNow: 'Prenota ora',
  restaurant: 'Ristorante',
  hotel: 'Hotel',
  dubai: 'Dubai',
  music: 'Musica',
  membership: 'Iscrizione',
  merchandise: 'Merchandising',
  epsomRaces: 'Epsom Races',
  connect: 'Connettiti',
  aboutUs: 'Chi siamo',
  eventsCalendar: 'Calendario eventi',
  partners: 'Partner',
  workWithUs: 'Lavora con noi',
  accountLogin: 'Accedi al tuo account',
  contactUs: 'Contattaci',
  discoverBlogBurger: 'Scopri il nostro blog',
  footerCta: 'Non abbiamo inventato il pool party, lo abbiamo solo perfezionato.',
  subscribe: 'Iscriviti',
  yourEmail: 'La tua email',
  newsletterDesc:
    "Resta aggiornato su ciò che succede sull'isola in pochi clic. Dall'ispirazione ibizenca alla motivazione musicale, promettiamo di portare nella tua casella solo bei momenti.",
  newsletterOk: 'Fantastico! Sei iscritto alla nostra newsletter.',
  newsletterErr: 'Qualcosa è andato storto. Controlla il tuo indirizzo email e riprova.',
  locationTitle: 'La nostra posizione (vieni a trovarci!)',
  viewMap: 'Vedi mappa',
  headlineInfo: 'Informazioni principali',
  supportingInfo: 'Informazioni aggiuntive',
  enquiriesTitle: 'Per qualsiasi richiesta di prenotazione contatta',
  myAccount: 'Il mio account',
  faqs: 'FAQ',
  press: 'Stampa',
  terms: 'Termini e condizioni',
  privacy: 'Informativa sulla privacy',
  internalInfo: 'Informazioni interne',
  discoverBlog: 'Scopri il nostro blog',
  jumpIn: 'Entra',
  copyright: '© O Beach Ibiza 2026 Tutti i diritti riservati | NON SIAMO IN ALCUN MODO COLLEGATI A OCEAN CLUB MARBELLA.',
};

const fr: UiKeys = {
  bookABed: 'Réservez un lit',
  menu: 'Menu',
  close: 'Fermer',
  dayClub: 'Day Club',
  packages: 'Formules',
  celebrationPackages: 'Formules célébration',
  bedMenus: 'Menus des lits',
  bookNow: 'Réservez',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  dubai: 'Dubaï',
  music: 'Musique',
  membership: 'Adhésion',
  merchandise: 'Boutique',
  epsomRaces: 'Epsom Races',
  connect: 'Suivez-nous',
  aboutUs: 'À propos',
  eventsCalendar: 'Calendrier des événements',
  partners: 'Partenaires',
  workWithUs: 'Travaillez avec nous',
  accountLogin: 'Connexion au compte',
  contactUs: 'Contactez-nous',
  discoverBlogBurger: 'Découvrez notre blog',
  footerCta: "Nous n'avons pas inventé la pool party, nous l'avons juste perfectionnée.",
  subscribe: "S'abonner",
  yourEmail: 'Votre e-mail',
  newsletterDesc:
    "Restez au courant de ce qui se passe sur l'île en quelques clics. De l'inspiration ibizienne à la motivation musicale, nous promettons de n'apporter que de bons moments dans votre boîte mail.",
  newsletterOk: 'Génial ! Vous êtes abonné à notre newsletter.',
  newsletterErr: 'Une erreur est survenue. Vérifiez votre adresse e-mail et réessayez.',
  locationTitle: 'Notre emplacement (venez nous voir !)',
  viewMap: 'Voir la carte',
  headlineInfo: 'Informations principales',
  supportingInfo: 'Informations complémentaires',
  enquiriesTitle: 'Pour toute demande de réservation, contactez',
  myAccount: 'Mon compte',
  faqs: 'FAQ',
  press: 'Presse',
  terms: 'Conditions générales',
  privacy: 'Politique de confidentialité',
  internalInfo: 'Informations internes',
  discoverBlog: 'Découvrez notre blog',
  jumpIn: 'Plongez',
  copyright: '© O Beach Ibiza 2026 Tous droits réservés | NOUS NE SOMMES EN AUCUN CAS LIÉS À OCEAN CLUB MARBELLA.',
};

const de: UiKeys = {
  bookABed: 'Bett buchen',
  menu: 'Menü',
  close: 'Schließen',
  dayClub: 'Day Club',
  packages: 'Pakete',
  celebrationPackages: 'Feier-Pakete',
  bedMenus: 'Bett-Menüs',
  bookNow: 'Jetzt buchen',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  dubai: 'Dubai',
  music: 'Musik',
  membership: 'Mitgliedschaft',
  merchandise: 'Merchandise',
  epsomRaces: 'Epsom Races',
  connect: 'Vernetzen',
  aboutUs: 'Über uns',
  eventsCalendar: 'Veranstaltungskalender',
  partners: 'Partner',
  workWithUs: 'Arbeite mit uns',
  accountLogin: 'Konto-Login',
  contactUs: 'Kontakt',
  discoverBlogBurger: 'Entdecke unseren Blog',
  footerCta: 'Wir haben die Poolparty nicht erfunden, wir haben sie nur perfektioniert.',
  subscribe: 'Abonnieren',
  yourEmail: 'Deine E-Mail',
  newsletterDesc:
    'Bleib mit wenigen Klicks über das Inselgeschehen auf dem Laufenden. Von Ibiza-Inspiration bis zu musikalischer Motivation – wir versprechen, deinem Posteingang nur gute Zeiten zu liefern.',
  newsletterOk: 'Super! Du hast unseren Newsletter abonniert.',
  newsletterErr: 'Etwas ist schiefgelaufen. Bitte überprüfe deine E-Mail-Adresse und versuche es erneut.',
  locationTitle: 'Unser Standort (komm vorbei!)',
  viewMap: 'Karte ansehen',
  headlineInfo: 'Wichtige Infos',
  supportingInfo: 'Weitere Infos',
  enquiriesTitle: 'Für alle Reservierungsanfragen kontaktiere',
  myAccount: 'Mein Konto',
  faqs: 'FAQ',
  press: 'Presse',
  terms: 'AGB',
  privacy: 'Datenschutzerklärung',
  internalInfo: 'Interne Informationen',
  discoverBlog: 'Entdecke unseren Blog',
  jumpIn: 'Spring rein',
  copyright: '© O Beach Ibiza 2026 Alle Rechte vorbehalten | WIR STEHEN IN KEINERLEI VERBINDUNG ZUM OCEAN CLUB MARBELLA.',
};

const ui: Record<Locale, UiKeys> = { en, es, it, fr, de };

/** Devuelve la función de traducción para un locale (cae a inglés si falta). */
export function useTranslations(locale: string | undefined) {
  const l = (locales as readonly string[]).includes(locale ?? '') ? (locale as Locale) : defaultLocale;
  return (key: keyof UiKeys): string => ui[l][key] ?? ui[defaultLocale][key];
}

/** Prefija una ruta interna con el locale (el inglés no lleva prefijo). */
export function localePath(locale: string | undefined, path: string): string {
  const l = (locales as readonly string[]).includes(locale ?? '') ? (locale as Locale) : defaultLocale;
  if (l === defaultLocale) return path;
  if (!path.startsWith('/')) return path; // externas, mailto, anclas...
  return `/${l}${path}`;
}

/** Páginas con slug propio por idioma (no siguen el patrón /<locale>/<slug>) */
const slugAliases: Array<{ match: RegExp; paths: Partial<Record<Locale, string>>; fallback: string }> = [
  {
    // /es/terminos-y-condiciones es una página ES dedicada; el resto usa terms-conditions
    match: /^\/term(s-conditions|inos-y-condiciones)\/?$/,
    paths: { es: '/es/terminos-y-condiciones/' },
    fallback: '/terms-conditions/',
  },
];

/** Ruta equivalente de la página actual en otro idioma (para el selector). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/(es|it|fr|de)(?=\/|$)/, '') || '/';
  for (const alias of slugAliases) {
    if (alias.match.test(stripped)) {
      return alias.paths[target] ?? localePath(target, alias.fallback);
    }
  }
  return target === defaultLocale ? stripped : `/${target}${stripped === '/' ? '/' : stripped}`;
}
