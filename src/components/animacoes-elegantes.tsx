import React, { useEffect, useRef, useState } from "react";

/** 12 animações discretas e elegantes (#39–#50) com prévia e código autossuficiente. */
export type ElegantStyle = {
  id: string;
  nome: string;
  descricao: string;
  render: () => React.ReactElement;
  code: string;
};

/** Remonta o filho a cada `ms` para a prévia repetir animações de entrada. */
function useReplay(ms: number) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((v) => v + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return k;
}

function FadeScroll() {
  const k = useReplay(3200);
  return (
    <div key={k} className="grid h-full place-content-center gap-2 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-5 w-48 rounded bg-white/15" style={{ animation: `el-fadeup .9s cubic-bezier(.2,.7,.2,1) ${i * 0.15}s both` }} />
      ))}
    </div>
  );
}

function MaskReveal() {
  const k = useReplay(3200);
  return (
    <div key={k} className="grid h-full place-items-center">
      <div className="relative overflow-hidden px-2 text-2xl font-semibold tracking-tight text-white/90">
        <span style={{ animation: "el-show 1.4s steps(1) both" }}>Elegância pura</span>
        <span className="absolute inset-0 bg-white/80" style={{ animation: "el-mask 1.4s cubic-bezier(.7,0,.3,1) both" }} />
      </div>
    </div>
  );
}

function Counter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1800);
      setN(Math.round(500 * (1 - Math.pow(1 - p, 3))));
      if (t - start > 3200) start = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="grid h-full place-content-center text-center">
      <div className="text-4xl font-bold tabular-nums text-white">+{n}</div>
      <div className="text-xs uppercase tracking-widest text-white/50">clientes</div>
    </div>
  );
}

function TypewriterSoft() {
  const text = "Sites que encantam.";
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v > text.length + 12 ? 0 : v + 1)), 90);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid h-full place-items-center font-mono text-lg text-white/90">
      <span>
        {text.slice(0, i)}
        <span className="ml-0.5 inline-block w-[2px] bg-white/80" style={{ height: "1.1em", verticalAlign: "-0.15em", animation: "el-blink 1s steps(1) infinite" }} />
      </span>
    </div>
  );
}

function SlowShine() {
  return (
    <div className="grid h-full place-items-center">
      <button className="relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white">
        Começar agora
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: "el-shine 3.5s ease-in-out infinite" }} />
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex h-full items-center gap-3 p-5">
      <div className="size-12 shrink-0 rounded-full bg-white/10" style={{ animation: "el-pulse 1.5s ease-in-out infinite" }} />
      <div className="flex-1 space-y-2">
        {["w-3/4", "w-full", "w-1/2"].map((w, i) => (
          <div key={i} className={`h-3 rounded bg-white/10 ${w}`} style={{ animation: `el-pulse 1.5s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function TiltCard() {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  };
  return (
    <div className="grid h-full place-items-center">
      <div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={() => ref.current && (ref.current.style.transform = "")}
        className="grid h-24 w-40 place-items-center rounded-xl border border-white/10 bg-white/10 text-sm text-white/80"
        style={{ transition: "transform .2s ease-out" }}
      >
        Passe o mouse
      </div>
    </div>
  );
}

function BorderDraw() {
  return (
    <div className="grid h-full place-items-center">
      <div className="el-draw relative grid h-24 w-40 place-items-center text-sm text-white/80">
        <svg className="absolute inset-0 size-full" viewBox="0 0 160 96" preserveAspectRatio="none">
          <rect x="1" y="1" width="158" height="94" rx="12" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.5" pathLength={1} />
        </svg>
        Passe o mouse
      </div>
    </div>
  );
}

function BreathingGradient() {
  return (
    <div
      className="h-full w-full"
      style={{
        background: "linear-gradient(120deg,#1e1b3a,#23395d,#3b2a4d,#1e1b3a)",
        backgroundSize: "300% 300%",
        animation: "el-breathe 14s ease-in-out infinite",
      }}
    />
  );
}

function GrowUnderline() {
  return (
    <div className="grid h-full place-items-center gap-2">
      {["Sobre", "Serviços", "Contato"].map((t) => (
        <a key={t} href="#" onClick={(e) => e.preventDefault()} className="el-under relative text-white/85">
          {t}
        </a>
      ))}
    </div>
  );
}

function LogoMarquee() {
  const logos = ["ACME", "Nova", "Orbit", "Lumen", "Vertex", "Pulse"];
  return (
    <div className="flex h-full items-center overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)" }}>
      <div className="flex shrink-0 gap-10 pr-10" style={{ animation: "el-marq 18s linear infinite", width: "max-content" }}>
        {[...logos, ...logos].map((l, i) => (
          <span key={i} className="text-lg font-semibold tracking-wide text-white/50">{l}</span>
        ))}
      </div>
    </div>
  );
}

function BlurIn() {
  const k = useReplay(3200);
  return (
    <div key={k} className="grid h-full place-items-center">
      <div className="text-2xl font-semibold text-white" style={{ animation: "el-blur 1.2s ease-out both" }}>
        Em foco
      </div>
    </div>
  );
}

export const ELEGANT_CSS = `
@keyframes el-fadeup { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
@keyframes el-mask { 0% { transform: translateX(-101%) } 45%,55% { transform: translateX(0) } 100% { transform: translateX(101%) } }
@keyframes el-show { 0% { opacity: 0 } 50%,100% { opacity: 1 } }
@keyframes el-blink { 50% { opacity: 0 } }
@keyframes el-shine { 0% { left: -50% } 60%,100% { left: 130% } }
@keyframes el-pulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
.el-draw rect { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s ease; }
.el-draw:hover rect { stroke-dashoffset: 0; }
@keyframes el-breathe { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
.el-under::after { content: ""; position: absolute; left: 50%; right: 50%; bottom: -3px; height: 1.5px; background: currentColor; transition: left .3s ease, right .3s ease; }
.el-under:hover::after { left: 0; right: 0; }
@keyframes el-marq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes el-blur { from { opacity: 0; filter: blur(12px); transform: scale(.97) } to { opacity: 1; filter: blur(0); transform: none } }
`;

const C = {
  fade: `<!-- Fade-in ao rolar -->
<div class="reveal">Conteúdo que aparece ao rolar</div>
<style>
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
.reveal.is-visible { opacity: 1; transform: none; }
</style>
<script>
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
</script>`,
  mask: `<!-- Revelar por máscara -->
<h2 class="mask-reveal"><span>Elegância pura</span></h2>
<style>
.mask-reveal { position: relative; display: inline-block; overflow: hidden; }
.mask-reveal span { opacity: 0; animation: mr-show 1.4s steps(1) forwards; }
.mask-reveal::after { content: ""; position: absolute; inset: 0; background: currentColor; transform: translateX(-101%); animation: mr-bar 1.4s cubic-bezier(.7,0,.3,1) forwards; }
@keyframes mr-bar { 45%,55% { transform: translateX(0) } 100% { transform: translateX(101%) } }
@keyframes mr-show { 50%,100% { opacity: 1 } }
</style>`,
  counter: `<!-- Contador animado -->
<span class="counter" data-to="500">0</span> clientes
<script>
document.querySelectorAll('.counter').forEach(el => {
  const to = +el.dataset.to, dur = 1800;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR'); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  io.observe(el);
});
</script>`,
  type: `<!-- Máquina de escrever -->
<span class="tw" data-text="Sites que encantam."></span><span class="tw-cursor">|</span>
<style>.tw-cursor { animation: tw-blink 1s steps(1) infinite; } @keyframes tw-blink { 50% { opacity: 0 } }</style>
<script>
document.querySelectorAll('.tw').forEach(el => {
  const txt = el.dataset.text; let i = 0;
  const tick = () => { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(tick, 80); };
  tick();
});
</script>`,
  shine: `<!-- Brilho passando -->
<button class="shine-btn">Começar agora</button>
<style>
.shine-btn { position: relative; overflow: hidden; padding: 12px 24px; border-radius: 12px; border: 0; background: #1f2937; color: #fff; }
.shine-btn::after { content: ""; position: absolute; top: 0; bottom: 0; left: -50%; width: 33%; transform: skewX(-12deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent); animation: shine 3.5s ease-in-out infinite; }
@keyframes shine { 60%,100% { left: 130% } }
</style>`,
  skeleton: `<!-- Esqueleto de carregamento -->
<div class="sk-row"><div class="sk sk-avatar"></div><div style="flex:1"><div class="sk" style="width:75%"></div><div class="sk"></div><div class="sk" style="width:50%"></div></div></div>
<style>
.sk-row { display: flex; gap: 12px; align-items: center; }
.sk { height: 12px; margin: 8px 0; border-radius: 6px; background: #e5e7eb; animation: sk-pulse 1.5s ease-in-out infinite; }
.sk-avatar { width: 48px; height: 48px; border-radius: 50%; margin: 0; }
@keyframes sk-pulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
</style>`,
  tilt: `<!-- Cartão com inclinação -->
<div class="tilt-card">Passe o mouse</div>
<style>.tilt-card { width: 240px; padding: 40px; border-radius: 16px; background: #f3f4f6; transition: transform .2s ease-out; }</style>
<script>
document.querySelectorAll('.tilt-card').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = \`perspective(600px) rotateY(\${x * 12}deg) rotateX(\${-y * 12}deg)\`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});
</script>`,
  draw: `<!-- Borda desenhando -->
<div class="draw-card">
  <svg viewBox="0 0 160 96" preserveAspectRatio="none"><rect x="1" y="1" width="158" height="94" rx="12" pathLength="1"/></svg>
  Passe o mouse
</div>
<style>
.draw-card { position: relative; width: 240px; height: 144px; display: grid; place-items: center; }
.draw-card svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.draw-card rect { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s ease; }
.draw-card:hover rect { stroke-dashoffset: 0; }
</style>`,
  breathe: `<!-- Gradiente respirando -->
<section class="breathe">Seu conteúdo</section>
<style>
.breathe { min-height: 60vh; background: linear-gradient(120deg,#1e1b3a,#23395d,#3b2a4d,#1e1b3a); background-size: 300% 300%; animation: breathe 14s ease-in-out infinite; }
@keyframes breathe { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
</style>`,
  under: `<!-- Sublinhado crescendo -->
<a href="#" class="grow-underline">Serviços</a>
<style>
.grow-underline { position: relative; text-decoration: none; color: inherit; }
.grow-underline::after { content: ""; position: absolute; left: 50%; right: 50%; bottom: -3px; height: 1.5px; background: currentColor; transition: left .3s ease, right .3s ease; }
.grow-underline:hover::after { left: 0; right: 0; }
</style>`,
  marquee: `<!-- Faixa infinita de logos -->
<div class="marquee"><div class="marquee-track">
  <span>ACME</span><span>Nova</span><span>Orbit</span><span>Lumen</span><span>Vertex</span><span>Pulse</span>
  <span>ACME</span><span>Nova</span><span>Orbit</span><span>Lumen</span><span>Vertex</span><span>Pulse</span>
</div></div>
<style>
.marquee { overflow: hidden; -webkit-mask-image: linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent); mask-image: linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent); }
.marquee-track { display: flex; gap: 40px; width: max-content; animation: marquee 18s linear infinite; }
.marquee-track span { opacity: .5; font-weight: 600; }
.marquee:hover .marquee-track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(calc(-50% - 20px)) } }
</style>`,
  blur: `<!-- Desfoque entrando -->
<h2 class="blur-in">Em foco</h2>
<style>
.blur-in { opacity: 0; filter: blur(12px); transform: scale(.97); transition: opacity 1.2s ease-out, filter 1.2s ease-out, transform 1.2s ease-out; }
.blur-in.is-visible { opacity: 1; filter: blur(0); transform: none; }
</style>
<script>
const bio = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); bio.unobserve(e.target); } }));
document.querySelectorAll('.blur-in').forEach(el => bio.observe(el));
</script>`,
};

export const ELEGANT_STYLES: ElegantStyle[] = [
  { id: "fade-scroll", nome: "Fade-in ao rolar", descricao: "Elemento aparece subindo suave quando entra na tela.", render: () => <FadeScroll />, code: C.fade },
  { id: "mask-reveal", nome: "Revelar por máscara", descricao: "Texto ou imagem descoberto por uma faixa que desliza.", render: () => <MaskReveal />, code: C.mask },
  { id: "animated-counter", nome: "Contador animado", descricao: "Número subindo de 0 até o valor (ex.: 500 clientes).", render: () => <Counter />, code: C.counter },
  { id: "typewriter-soft", nome: "Máquina de escrever", descricao: "Texto digitado letra por letra, com cursor piscando.", render: () => <TypewriterSoft />, code: C.type },
  { id: "slow-shine", nome: "Brilho passando", descricao: "Reflexo cruzando um botão ou cartão, devagar.", render: () => <SlowShine />, code: C.shine },
  { id: "skeleton", nome: "Esqueleto de carregamento", descricao: "Blocos cinza pulsando enquanto o conteúdo carrega.", render: () => <Skeleton />, code: C.skeleton },
  { id: "tilt-card", nome: "Cartão com inclinação", descricao: "O cartão inclina de leve seguindo o mouse.", render: () => <TiltCard />, code: C.tilt },
  { id: "border-draw", nome: "Borda desenhando", descricao: "A borda do cartão se desenha sozinha ao passar o mouse.", render: () => <BorderDraw />, code: C.draw },
  { id: "breathing-gradient", nome: "Gradiente respirando", descricao: "Fundo com gradiente que muda de posição bem devagar.", render: () => <BreathingGradient />, code: C.breathe },
  { id: "grow-underline", nome: "Sublinhado crescendo", descricao: "Link ganha um traço que cresce do centro ao passar o mouse.", render: () => <GrowUnderline />, code: C.under },
  { id: "logo-marquee", nome: "Faixa infinita", descricao: "Logos de marcas deslizando em laço contínuo.", render: () => <LogoMarquee />, code: C.marquee },
  { id: "blur-in", nome: "Desfoque entrando", descricao: "Elemento sai do desfoque e entra em foco ao aparecer.", render: () => <BlurIn />, code: C.blur },
];
