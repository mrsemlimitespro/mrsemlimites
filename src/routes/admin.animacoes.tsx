import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/animacoes")({
  head: () => ({
    meta: [
      { title: "Catálogo de Animações — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AnimacoesPage,
});

type Style = {
  id: string;
  nome: string;
  descricao: string;
  render: () => JSX.Element;
};

const STYLES: Style[] = [
  {
    id: "neon-marquee",
    nome: "Neon Marquee",
    descricao: "Esteira infinita com cards de gradiente e glow neon pulsante em volta.",
    render: () => <NeonMarquee />,
  },
  {
    id: "glass-tilt",
    nome: "Glass Tilt",
    descricao: "Cards de vidro fosco com leve tilt 3D no hover.",
    render: () => <GlassTilt />,
  },
  {
    id: "gradient-flow",
    nome: "Gradient Flow",
    descricao: "Fundo com gradiente colorido que se move suavemente em loop.",
    render: () => <GradientFlow />,
  },
  {
    id: "shimmer-sweep",
    nome: "Shimmer Sweep",
    descricao: "Faixa de luz atravessando o elemento (efeito holográfico).",
    render: () => <ShimmerSweep />,
  },
  {
    id: "pulse-glow",
    nome: "Pulse Glow",
    descricao: "Botão/ícone com halo pulsando (chama atenção sem distrair).",
    render: () => <PulseGlow />,
  },
  {
    id: "float-orb",
    nome: "Float Orb",
    descricao: "Blobs coloridos flutuando lentamente no fundo (aurora).",
    render: () => <FloatOrb />,
  },
  {
    id: "flip-card",
    nome: "Flip Card",
    descricao: "Card gira 180° no hover, revelando o verso.",
    render: () => <FlipCard />,
  },
  {
    id: "reveal-up",
    nome: "Reveal Up",
    descricao: "Elemento sobe e aparece ao entrar na tela.",
    render: () => <RevealUp />,
  },
  {
    id: "count-up",
    nome: "Count Up",
    descricao: "Números animando de 0 até o valor final.",
    render: () => <CountUp />,
  },
  {
    id: "typewriter",
    nome: "Typewriter",
    descricao: "Texto digitando letra por letra com cursor piscando.",
    render: () => <Typewriter />,
  },
  {
    id: "aurora-hero",
    nome: "Aurora Hero",
    descricao: "Hero com auroras coloridas em movimento (topo de página).",
    render: () => <AuroraHero />,
  },
  {
    id: "particles-soft",
    nome: "Particles Soft",
    descricao: "Partículas leves subindo (chuva de brilho).",
    render: () => <ParticlesSoft />,
  },
  {
    id: "morph-blob",
    nome: "Morph Blob",
    descricao: "Blob colorido mudando de forma continuamente.",
    render: () => <MorphBlob />,
  },
  {
    id: "border-scan",
    nome: "Border Scan",
    descricao: "Linha de luz correndo pela borda do card.",
    render: () => <BorderScan />,
  },
  {
    id: "hover-scale",
    nome: "Hover Scale",
    descricao: "Card cresce e ilumina no hover — clássico e limpo.",
    render: () => <HoverScale />,
  },
  {
    id: "stagger-list",
    nome: "Stagger List",
    descricao: "Lista aparece item por item em cascata.",
    render: () => <StaggerList />,
  },
  {
    id: "gradient-text",
    nome: "Gradient Text",
    descricao: "Título com gradiente animado atravessando as letras.",
    render: () => <GradientText />,
  },
  {
    id: "spotlight",
    nome: "Spotlight",
    descricao: "Foco de luz seguindo o cursor sobre o card.",
    render: () => <Spotlight />,
  },
];

function AnimacoesPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, nome: string) => {
    navigator.clipboard.writeText(`Aplica o estilo "${nome}" (${id})`);
    setCopied(id);
    toast.success(`Copiado: "${nome}"`);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="size-3.5" /> Catálogo Privado
        </div>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text-warm">Animações disponíveis</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Todos os estilos que sei aplicar. Cada card tem um <b>nome</b> — copie
          e me peça: <i>"Aplica o estilo Neon Marquee no carrossel"</i> ou
          <i> "Usa Aurora Hero na home do outro projeto"</i>. Funciona aqui e em
          qualquer projeto novo.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {STYLES.map((s, idx) => (
          <div
            key={s.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  #{String(idx + 1).padStart(2, "0")}
                </div>
                <div className="text-lg font-bold">{s.nome}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.descricao}
                </div>
              </div>
              <button
                onClick={() => copy(s.id, s.nome)}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                title="Copiar nome do estilo"
              >
                {copied === s.id ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            <div className="relative h-40 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {s.render()}
            </div>
          </div>
        ))}
      </div>

      <style>{DEMO_CSS}</style>
    </div>
  );
}

/* ---------- Demos ---------- */

function NeonMarquee() {
  const items = [
    { g: "from-fuchsia-500 to-orange-400", c: "255,60,180" },
    { g: "from-violet-500 to-cyan-400", c: "80,120,255" },
    { g: "from-emerald-400 to-cyan-400", c: "40,240,200" },
    { g: "from-amber-400 to-red-500", c: "255,140,40" },
    { g: "from-indigo-500 to-pink-500", c: "200,80,255" },
  ];
  const track = [...items, ...items];
  return (
    <div className="flex h-full items-center overflow-hidden">
      <div className="flex gap-3 whitespace-nowrap" style={{ animation: "marq 14s linear infinite", width: "max-content" }}>
        {track.map((it, i) => (
          <div
            key={i}
            className={`h-16 w-28 shrink-0 rounded-lg bg-gradient-to-br ${it.g}`}
            style={{
              boxShadow: `0 0 0 2px rgba(${it.c},.9), 0 0 18px rgba(${it.c},.7), 0 0 32px rgba(${it.c},.5)`,
              animation: `neonp 2.2s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GlassTilt() {
  return (
    <div className="grid h-full place-items-center perspective-[900px]">
      <div className="tilt h-24 w-40 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl" />
    </div>
  );
}

function GradientFlow() {
  return <div className="h-full w-full" style={{ background: "linear-gradient(120deg,#ff3ea5,#7a5cff,#3ec8ff,#3effa5,#ff3ea5)", backgroundSize: "300% 300%", animation: "flow 8s ease infinite" }} />;
}

function ShimmerSweep() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative h-20 w-52 overflow-hidden rounded-xl bg-white/5 border border-white/10">
        <div className="absolute inset-y-0 -left-1/2 w-1/2" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)", animation: "sweep 2s linear infinite" }} />
      </div>
    </div>
  );
}

function PulseGlow() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-fuchsia-500/60 blur-xl" style={{ animation: "pg 1.6s ease-in-out infinite" }} />
        <div className="relative size-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 shadow-2xl" />
      </div>
    </div>
  );
}

function FloatOrb() {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute size-24 rounded-full bg-fuchsia-500/50 blur-2xl" style={{ top: "10%", left: "10%", animation: "orb1 6s ease-in-out infinite" }} />
      <div className="absolute size-24 rounded-full bg-cyan-500/50 blur-2xl" style={{ top: "40%", left: "50%", animation: "orb2 7s ease-in-out infinite" }} />
      <div className="absolute size-24 rounded-full bg-violet-500/50 blur-2xl" style={{ top: "20%", right: "10%", animation: "orb3 8s ease-in-out infinite" }} />
    </div>
  );
}

function FlipCard() {
  return (
    <div className="grid h-full place-items-center perspective-[900px]">
      <div className="flip h-24 w-36 [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 [backface-visibility:hidden] grid place-items-center text-white font-bold">FRENTE</div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 [transform:rotateY(180deg)] [backface-visibility:hidden] grid place-items-center text-white font-bold">VERSO</div>
      </div>
    </div>
  );
}

function RevealUp() {
  return (
    <div className="grid h-full place-items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-4 w-40 rounded bg-gradient-to-r from-cyan-400 to-violet-500" style={{ animation: `revup 2.5s ease-out ${i * 0.3}s infinite` }} />
      ))}
    </div>
  );
}

function CountUp() {
  return (
    <div className="grid h-full place-items-center">
      <div className="text-5xl font-black tabular-nums" style={{ animation: "cu 3s steps(30) infinite" }}>
        <CountUpNum />
      </div>
    </div>
  );
}
function CountUpNum() {
  return <span className="gradient-text-warm">1.284</span>;
}

function Typewriter() {
  return (
    <div className="grid h-full place-items-center">
      <div className="font-mono text-sm text-emerald-300">
        <span className="typew">criando magia...</span>
        <span className="ml-0.5 inline-block h-4 w-0.5 bg-emerald-300 align-middle" style={{ animation: "cursor 1s steps(1) infinite" }} />
      </div>
    </div>
  );
}

function AuroraHero() {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(600px at 20% 30%, rgba(255,60,180,.5), transparent 60%), radial-gradient(500px at 80% 60%, rgba(80,120,255,.5), transparent 60%), radial-gradient(400px at 50% 90%, rgba(40,240,200,.4), transparent 60%)", animation: "flow 10s ease infinite", backgroundSize: "200% 200%" }} />
      <div className="relative grid h-full place-items-center text-white font-black text-xl">AURORA</div>
    </div>
  );
}

function ParticlesSoft() {
  return (
    <div className="relative h-full overflow-hidden bg-black/40">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute size-1 rounded-full bg-white/80"
          style={{
            left: `${(i * 47) % 100}%`,
            bottom: "-10px",
            animation: `rise ${4 + (i % 5)}s linear ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function MorphBlob() {
  return (
    <div className="grid h-full place-items-center">
      <div className="size-24 bg-gradient-to-br from-fuchsia-500 to-cyan-400" style={{ animation: "morph 6s ease-in-out infinite", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />
    </div>
  );
}

function BorderScan() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative h-24 w-40 rounded-xl bg-black/60">
        <div className="absolute inset-0 rounded-xl" style={{ background: "conic-gradient(from 0deg, transparent 0 70%, #ff3ea5 80%, #3ec8ff 90%, transparent 100%)", animation: "spin 3s linear infinite", padding: "2px", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
      </div>
    </div>
  );
}

function HoverScale() {
  return (
    <div className="grid h-full place-items-center">
      <div className="h-20 w-32 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(40,240,200,0.7)] cursor-pointer" />
    </div>
  );
}

function StaggerList() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-3 w-40 rounded bg-gradient-to-r from-violet-500 to-pink-500"
          style={{ animation: `stag 3s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}

function GradientText() {
  return (
    <div className="grid h-full place-items-center">
      <div className="text-3xl font-black bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#ff3ea5,#7a5cff,#3ec8ff,#ff3ea5)", backgroundSize: "200% 100%", animation: "flow 3s linear infinite", WebkitBackgroundClip: "text" }}>
        BRILHANTE
      </div>
    </div>
  );
}

function Spotlight() {
  return (
    <div
      className="relative grid h-full place-items-center bg-black/50"
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
      style={{ backgroundImage: "radial-gradient(180px at var(--x,50%) var(--y,50%), rgba(255,60,180,.35), transparent 70%)" }}
    >
      <span className="text-sm text-white/70">mova o mouse aqui</span>
    </div>
  );
}

const DEMO_CSS = `
@keyframes marq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes neonp { 0%,100% { filter: brightness(1) saturate(1.2) } 50% { filter: brightness(1.3) saturate(1.6) } }
@keyframes flow { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
@keyframes sweep { 0% { transform: translateX(0) } 100% { transform: translateX(400%) } }
@keyframes pg { 0%,100% { transform: scale(1); opacity: .6 } 50% { transform: scale(1.4); opacity: .2 } }
@keyframes orb1 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(30px,20px) } }
@keyframes orb2 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-40px,-15px) } }
@keyframes orb3 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-20px,25px) } }
@keyframes revup { 0% { opacity: 0; transform: translateY(20px) } 30%,70% { opacity: 1; transform: translateY(0) } 100% { opacity: 0; transform: translateY(-20px) } }
@keyframes cu { 0% { opacity: .4 } 100% { opacity: 1 } }
@keyframes cursor { 50% { opacity: 0 } }
@keyframes rise { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-180px); opacity: 0 } }
@keyframes morph { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40% } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60% } }
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes stag { 0%,100% { transform: translateX(-20px); opacity: .3 } 50% { transform: translateX(0); opacity: 1 } }
.tilt { transition: transform .4s ease; }
.tilt:hover { transform: rotateY(15deg) rotateX(8deg) scale(1.05); }
.flip { position: relative; transition: transform .6s; }
.flip:hover { transform: rotateY(180deg); }
.typew { display: inline-block; overflow: hidden; white-space: nowrap; animation: typing 3s steps(16) infinite; }
@keyframes typing { 0%,10% { width: 0 } 60%,100% { width: 100% } }
`;
