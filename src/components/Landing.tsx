import Link from "next/link";
import { SiteEffects } from "./SiteEffects";

const slides = [
  { src: "/assets/ig/atmosfera-01.png", alt: "Público de Disco Río en la noche" },
  { src: "/assets/ig/atmosfera-02.png", alt: "Amigos en la fiesta Disco Río" },
  { src: "/assets/ig/atmosfera-03.png", alt: "Momento en la pista de Disco Río" },
  { src: "/assets/ig/atmosfera-04.png", alt: "Invitados disfrutando la noche" },
  { src: "/assets/ig/atmosfera-05.png", alt: "Luces y gente en Disco Río" },
  { src: "/assets/ig/atmosfera-06.png", alt: "Grupo en El Pontón con Disco Río" },
  { src: "/assets/ig/atmosfera-07.png", alt: "Pareja en la fiesta" },
  { src: "/assets/ig/atmosfera-08.png", alt: "Baile en Disco Río" },
  { src: "/assets/ig/atmosfera-09.png", alt: "Noche de Disco Río" },
];

type EventInfo = {
  name: string;
  date_iso: string;
  venue: string;
  price: number;
  remaining: number;
} | null;

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function Landing({ event }: { event: EventInfo }) {
  return (
    <>
      <SiteEffects />
      <header className="site-header">
        <a className="logo-mark" href="#top" aria-label="Disco Río Fiesta">
          <img src="/assets/logo-disco-rio.png" alt="Disco Río" />
        </a>
        <nav className="nav" aria-label="Principal">
          <a href="#fiesta">La fiesta</a>
          <a href="#galeria">Galería</a>
          <a href="#djs">DJs</a>
          <a href="#entradas">Entradas</a>
        </nav>
        <Link className="header-cta" href="/entradas">
          Comprar
        </Link>
      </header>

      <main id="top">
        <section className="hero" aria-label="Inicio">
          <div className="hero-media" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2400&q=80"
              alt=""
              className="hero-img"
            />
            <div className="hero-wash" />
          </div>

          <div className="hero-content">
            <p className="hero-eyebrow animate-in">Posadas · Misiones</p>
            <h1 className="visually-hidden">Disco Río Fiesta</h1>
            <div className="hero-logo animate-in delay-1" aria-hidden="true">
              <div className="hero-logo-stack">
                <img className="hero-logo-base" src="/assets/logo-hero-base.png" alt="" />
                <span className="hero-logo-vinyl">
                  <img src="/assets/logo-vinyl.png" alt="" />
                </span>
              </div>
            </div>
            <p className="hero-tagline animate-in delay-2">
              Vinilos y clásicos de todos los tiempos, con el Paraná de fondo.
            </p>
            <div className="hero-actions animate-in delay-3">
              <Link className="btn btn-primary" href="/entradas">
                Comprar entradas
              </Link>
              <a className="btn btn-ghost" href="#galeria">
                Ver galería
              </a>
            </div>
          </div>

          <div className="hero-scroll" aria-hidden="true">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        <section id="fiesta" className="section fiesta">
          <div className="section-inner">
            <p className="section-label">La fiesta</p>
            <h2 className="section-title">
              Una pista de clásicos
              <br />
              frente al río
            </h2>
            <p className="section-copy">
              Disco Río es un colectivo de DJs que gira vinilos y revive hits de todas las épocas.
              Noches al aire libre, atardeceres sobre el Paraná y esa energía de fiesta que solo
              aparece cuando suena el clásico correcto.
            </p>
            <ul className="fiesta-points">
              <li>
                <strong>100% vinilo</strong>
                <span>Selección hecha a mano, con el calor del formato físico.</span>
              </li>
              <li>
                <strong>Clásicos de siempre</strong>
                <span>Pop, disco, rock y dance que todos conocen de memoria.</span>
              </li>
              <li>
                <strong>Orilla del Paraná</strong>
                <span>Atmósfera de río, cielo abierto y Posadas de fondo.</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="galeria" className="section galeria">
          <div className="section-inner">
            <p className="section-label">Atmósfera</p>
            <h2 className="section-title">
              La noche, el río
              <br />y el vinilo
            </h2>
            <p className="section-copy">
              Luces cálidas, cabina al aire libre y ese momento dorado cuando el sol se mete detrás
              del agua.
            </p>
          </div>
          <div className="carousel" aria-label="Fotos de Disco Río Fiesta">
            <div className="carousel-track">
              {[...slides, ...slides].map((slide, i) => (
                <figure
                  className="carousel-slide"
                  key={`${slide.src}-${i}`}
                  aria-hidden={i >= slides.length ? true : undefined}
                >
                  <img src={slide.src} alt={i >= slides.length ? "" : slide.alt} />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="djs" className="section djs">
          <div className="section-inner">
            <figure className="dj-shot">
              <img
                src="/assets/ig/cuatro-cabezas.png"
                alt="Los cuatro DJs de Disco Río detrás de la cabina, frente al río al atardecer"
                loading="lazy"
              />
              <figcaption className="dj-shot-copy">
                <p className="section-label">El colectivo</p>
                <h2 className="section-title">
                  Cuatro cabezas,
                  <br />
                  una sola pista
                </h2>
              </figcaption>
            </figure>
            <ul className="dj-roster">
              <li>
                <a href="https://www.instagram.com/dj_gustavomaddiona/" target="_blank" rel="noopener noreferrer">
                  <span className="dj-name">Gustavo Maddiona</span>
                  <span className="dj-handle">@dj_gustavomaddiona</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/cigandamarcelo/" target="_blank" rel="noopener noreferrer">
                  <span className="dj-name">Marcelo Ciganda</span>
                  <span className="dj-handle">@cigandamarcelo</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/mariano.amable/" target="_blank" rel="noopener noreferrer">
                  <span className="dj-name">Mariano Amable</span>
                  <span className="dj-handle">@mariano.amable</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/danipetruf/" target="_blank" rel="noopener noreferrer">
                  <span className="dj-name">Daniel Petruf</span>
                  <span className="dj-handle">@danipetruf</span>
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className="section scene">
          <div className="scene-panel">
            <video
              className="scene-video"
              src="/assets/ig/jornada-vinilos.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Video de Disco Río Fiesta en vivo"
            />
            <blockquote>
              <p>Una jornada de vinilos y clásicos de todos los tiempos.</p>
              <cite>Así nos presentan cuando salimos a tocar</cite>
            </blockquote>
          </div>
        </section>

        <section id="entradas" className="section ticket-section">
          <div className="section-inner ticket-card">
            <p className="section-label">Próxima fecha</p>
            {event ? (
              <>
                <h2 className="section-title">{event.name}</h2>
                <p className="section-copy">
                  {formatDate(event.date_iso)}
                  <br />
                  {event.venue}
                </p>
                <p className="ticket-price">
                  ${event.price.toLocaleString("es-AR")} <span>por entrada</span>
                </p>
                <p className="ticket-meta">{event.remaining} lugares disponibles</p>
                <Link className="btn btn-primary" href="/entradas">
                  Comprar entradas
                </Link>
              </>
            ) : (
              <>
                <h2 className="section-title">Próximamente</h2>
                <p className="section-copy">Estamos preparando la próxima fecha.</p>
              </>
            )}
          </div>
        </section>

        <section id="fotos" className="section fotos">
          <div className="section-inner">
            <p className="section-label">Recuerdos</p>
            <h2 className="section-title">Buscá tu foto</h2>
            <p className="section-copy">
              Después de cada fecha subimos el material a Instagram. Seguí @discoriofiesta y
              encontrá tu momento en el link del perfil.
            </p>
            <a
              className="btn btn-primary"
              href="https://www.instagram.com/discoriofiesta/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ir a @discoriofiesta
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-logo" href="#top" aria-label="Disco Río">
          <img src="/assets/logo-disco-rio-dark.png" alt="Disco Río" />
        </a>
        <p className="footer-meta">
          Posadas, Misiones · Río Paraná
          <br />
          <a href="https://www.instagram.com/discoriofiesta/" target="_blank" rel="noopener noreferrer">
            instagram.com/discoriofiesta
          </a>
        </p>
        <p className="footer-note">
          <Link href="/entradas">Comprar entradas</Link> · Ticketera propia Disco Río
        </p>
      </footer>
    </>
  );
}
