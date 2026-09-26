import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Copy, Check, Play, Volume2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sons")({
  head: () => ({
    meta: [{ title: "Catálogo de Sons — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SonsPage,
});

/**
 * Cada som é uma lista de "passos" sintetizados com a Web Audio API (sem arquivos).
 * Chaves: f=frequência, to=glide, d=duração, w=onda, g=volume, at=início, a=ataque,
 * n=ruído, fl=filtro, ff/fto=freq. do filtro, q, vib/vd=vibrato.
 */
type Step = {
  f?: number; to?: number; d: number; w?: OscillatorType; g?: number; at?: number; a?: number;
  n?: 1; fl?: BiquadFilterType; ff?: number; fto?: number; q?: number; vib?: number; vd?: number;
};
type SoundDef = { nome: string; descricao: string; grupo: string; s: Step[] };

// Motor único: o mesmo texto roda na página e vai dentro do código copiado.
const ENGINE = `const T=ctx.currentTime+0.02;let end=0;
for(const s of S){const at=s.at||0,d=s.d,t0=T+at,g=s.g==null?0.2:s.g;end=Math.max(end,at+d);
const v=ctx.createGain();v.gain.setValueAtTime(0.0001,t0);v.gain.exponentialRampToValueAtTime(g,t0+(s.a||0.005));v.gain.exponentialRampToValueAtTime(0.0001,t0+d);
let src;if(s.n){const len=Math.max(1,Math.floor(ctx.sampleRate*d));const b=ctx.createBuffer(1,len,ctx.sampleRate);const c=b.getChannelData(0);for(let i=0;i<len;i++)c[i]=Math.random()*2-1;src=ctx.createBufferSource();src.buffer=b;}
else{src=ctx.createOscillator();src.type=s.w||"sine";src.frequency.setValueAtTime(s.f,t0);if(s.to)src.frequency.exponentialRampToValueAtTime(s.to,t0+d);
if(s.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=s.vib;lg.gain.value=s.vd||10;l.connect(lg).connect(src.frequency);l.start(t0);l.stop(t0+d+0.05);}}
let node=src;if(s.fl){const f=ctx.createBiquadFilter();f.type=s.fl;f.frequency.setValueAtTime(s.ff||1000,t0);if(s.fto)f.frequency.exponentialRampToValueAtTime(s.fto,t0+d);f.Q.value=s.q||1;node.connect(f);node=f;}
node.connect(v).connect(ctx.destination);src.start(t0);src.stop(t0+d+0.05);}
return end;`;

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const runSteps = new Function("ctx", "S", ENGINE) as (ctx: AudioContext, S: Step[]) => number;

const arp = (notes: number[], gap: number, d: number, w: OscillatorType = "sine", g = 0.18): Step[] =>
  notes.map((f, i) => ({ f, d, w, g, at: i * gap }));

const I = "Interface", C = "Confirmação", A = "Alerta", N = "Notificação", R = "Recompensa", M = "Movimento";

const SOUNDS: SoundDef[] = [
  // Interface (12)
  { grupo: I, nome: "Clique seco", descricao: "Clique seco e curto, para botão principal.", s: [{ f: 1800, d: 0.03, w: "square", g: 0.1 }, { n: 1, d: 0.02, g: 0.15, fl: "highpass", ff: 4000 }] },
  { grupo: I, nome: "Clique suave", descricao: "Toque arredondado, para botões secundários.", s: [{ f: 600, to: 400, d: 0.07, g: 0.25 }] },
  { grupo: I, nome: "Toque leve (hover)", descricao: "Quase imperceptível, para passar o mouse.", s: [{ f: 1200, d: 0.04, g: 0.06 }] },
  { grupo: I, nome: "Abrir", descricao: "Tom subindo, para abrir modal ou menu.", s: [{ f: 300, to: 700, d: 0.15, w: "triangle", g: 0.22 }] },
  { grupo: I, nome: "Fechar", descricao: "Tom descendo, para fechar modal ou menu.", s: [{ f: 700, to: 300, d: 0.15, w: "triangle", g: 0.22 }] },
  { grupo: I, nome: "Alternar ligado", descricao: "Dois toques subindo, para interruptor ligado.", s: [{ f: 520, d: 0.06, g: 0.2 }, { f: 780, d: 0.08, g: 0.2, at: 0.06 }] },
  { grupo: I, nome: "Alternar desligado", descricao: "Dois toques descendo, para interruptor desligado.", s: [{ f: 780, d: 0.06, g: 0.2 }, { f: 520, d: 0.08, g: 0.2, at: 0.06 }] },
  { grupo: I, nome: "Selecionar", descricao: "Acorde brilhante curto, para marcar um item.", s: [{ f: 880, d: 0.1, g: 0.14 }, { f: 1320, d: 0.1, g: 0.1 }] },
  { grupo: I, nome: "Apagar", descricao: "Ruído que se esvazia, para excluir algo.", s: [{ n: 1, d: 0.22, g: 0.3, fl: "bandpass", ff: 3000, fto: 400, q: 2 }] },
  { grupo: I, nome: "Navegar", descricao: "Passo duplo, para trocar de página ou aba.", s: [{ f: 440, d: 0.05, w: "triangle", g: 0.2 }, { f: 660, d: 0.05, w: "triangle", g: 0.2, at: 0.05 }] },
  { grupo: I, nome: "Expandir", descricao: "Timbre abrindo, para acordeão que expande.", s: [{ f: 220, d: 0.25, w: "sawtooth", g: 0.15, fl: "lowpass", ff: 300, fto: 3000 }] },
  { grupo: I, nome: "Recolher", descricao: "Timbre fechando, para acordeão que recolhe.", s: [{ f: 220, d: 0.25, w: "sawtooth", g: 0.15, fl: "lowpass", ff: 3000, fto: 300 }] },
  // Confirmação (8)
  { grupo: C, nome: "Sucesso curto", descricao: "Dois toques rápidos e positivos.", s: [{ f: 660, d: 0.08, g: 0.22 }, { f: 990, d: 0.15, g: 0.22, at: 0.08 }] },
  { grupo: C, nome: "Sucesso com dois tons", descricao: "Intervalo de quinta, mais caloroso.", s: [{ f: 523, d: 0.2, w: "triangle", g: 0.22 }, { f: 784, d: 0.35, w: "triangle", g: 0.22, at: 0.15 }] },
  { grupo: C, nome: "Concluído", descricao: "Arpejo de quatro notas, tarefa finalizada.", s: arp([523, 659, 784, 1047], 0.07, 0.18) },
  { grupo: C, nome: "Salvo", descricao: "Toque abafado e firme, para salvar.", s: [{ f: 330, d: 0.1, w: "square", g: 0.14, fl: "lowpass", ff: 1200 }, { f: 440, d: 0.15, w: "square", g: 0.14, at: 0.1, fl: "lowpass", ff: 1200 }] },
  { grupo: C, nome: "Enviado", descricao: "Subida com sopro, para mensagem enviada.", s: [{ f: 400, to: 1600, d: 0.25, g: 0.18 }, { n: 1, d: 0.25, g: 0.08, fl: "highpass", ff: 2000, fto: 6000 }] },
  { grupo: C, nome: "Copiado", descricao: "Dois tiques agudos e leves.", s: [{ f: 1500, d: 0.05, g: 0.1 }, { f: 2000, d: 0.05, g: 0.1, at: 0.06 }] },
  { grupo: C, nome: "Assinado", descricao: "Três notas com leve vibrato, tom de assinatura.", s: [{ f: 392, d: 0.15, w: "triangle", vib: 6, vd: 5 }, { f: 494, d: 0.15, w: "triangle", vib: 6, vd: 5, at: 0.1 }, { f: 587, d: 0.35, w: "triangle", vib: 6, vd: 5, at: 0.2 }] },
  { grupo: C, nome: "Desbloqueado", descricao: "Estalo de trava seguido de tom abrindo.", s: [{ n: 1, d: 0.03, g: 0.3, fl: "bandpass", ff: 2500, q: 4 }, { f: 300, to: 600, d: 0.2, w: "square", g: 0.12, at: 0.05, fl: "lowpass", ff: 800 }] },
  // Alerta (8)
  { grupo: A, nome: "Erro curto", descricao: "Buzina grave e breve.", s: [{ f: 180, d: 0.15, w: "square", g: 0.18, fl: "lowpass", ff: 900 }] },
  { grupo: A, nome: "Erro grave", descricao: "Dois tons dissonantes, falha séria.", s: [{ f: 110, d: 0.45, w: "sawtooth", g: 0.15, fl: "lowpass", ff: 700 }, { f: 117, d: 0.45, w: "sawtooth", g: 0.15, fl: "lowpass", ff: 700 }] },
  { grupo: A, nome: "Aviso", descricao: "Dois bipes médios, pede atenção.", s: [{ f: 880, d: 0.12, w: "triangle", g: 0.2 }, { f: 880, d: 0.12, w: "triangle", g: 0.2, at: 0.18 }] },
  { grupo: A, nome: "Negado", descricao: "Descida em dois passos, ação recusada.", s: [{ f: 300, d: 0.1, w: "square", g: 0.14, fl: "lowpass", ff: 1500 }, { f: 220, d: 0.2, w: "square", g: 0.14, at: 0.12, fl: "lowpass", ff: 1500 }] },
  { grupo: A, nome: "Campo inválido", descricao: "Tremido grave, campo de formulário errado.", s: [{ f: 250, d: 0.25, g: 0.25, vib: 30, vd: 40 }] },
  { grupo: A, nome: "Tempo esgotado", descricao: "Três tiques e um tom final longo.", s: [{ f: 1000, d: 0.08, g: 0.15 }, { f: 1000, d: 0.08, g: 0.15, at: 0.2 }, { f: 1000, d: 0.08, g: 0.15, at: 0.4 }, { f: 600, d: 0.45, g: 0.2, at: 0.6 }] },
  { grupo: A, nome: "Limite atingido", descricao: "Tom caindo pesado, cota esgotada.", s: [{ f: 400, to: 150, d: 0.35, w: "sawtooth", g: 0.15, fl: "lowpass", ff: 1500 }] },
  { grupo: A, nome: "Atenção", descricao: "Sirene curta alternando dois tons.", s: [0, 1, 2, 3].map((i) => ({ f: i % 2 ? 750 : 1000, d: 0.09, w: "square" as OscillatorType, g: 0.1, at: i * 0.1 })) },
  // Notificação (7)
  { grupo: N, nome: "Mensagem nova", descricao: "Plim de duas notas agudas.", s: [{ f: 1046, d: 0.12, g: 0.18 }, { f: 1318, d: 0.3, g: 0.18, at: 0.1 }] },
  { grupo: N, nome: "Aviso do sistema", descricao: "Tom único com ondulação suave.", s: [{ f: 587, d: 0.35, w: "triangle", g: 0.2, vib: 5, vd: 4 }] },
  { grupo: N, nome: "Lembrete", descricao: "Sino longo com harmônico, sem pressa.", s: [{ f: 784, d: 0.6, g: 0.2 }, { f: 1568, d: 0.4, g: 0.06 }] },
  { grupo: N, nome: "Chamada", descricao: "Trinado de telefone, chamada entrando.", s: [{ f: 460, d: 0.8, w: "square", g: 0.08, vib: 20, vd: 30, fl: "lowpass", ff: 2000 }] },
  { grupo: N, nome: "Pop-up", descricao: "Salto rápido para janelinha que surge.", s: [{ f: 300, to: 900, d: 0.08, g: 0.2 }, { f: 1200, d: 0.06, g: 0.12, at: 0.08 }] },
  { grupo: N, nome: "Chegada", descricao: "Arpejo subindo, alguém entrou.", s: arp([392, 523, 659], 0.09, 0.2, "triangle") },
  { grupo: N, nome: "Despedida", descricao: "Arpejo descendo, alguém saiu.", s: arp([659, 523, 392], 0.09, 0.22, "triangle") },
  // Recompensa (8)
  { grupo: R, nome: "Moeda", descricao: "Clássico de moeda coletada.", s: [{ f: 988, d: 0.08, w: "square", g: 0.1 }, { f: 1319, d: 0.3, w: "square", g: 0.1, at: 0.08 }] },
  { grupo: R, nome: "Ponto ganho", descricao: "Brilho agudo e rápido.", s: [{ f: 1760, d: 0.1, g: 0.15 }, { f: 2637, d: 0.15, g: 0.1, at: 0.05 }] },
  { grupo: R, nome: "Nível subiu", descricao: "Arpejo de cinco notas em estilo jogo.", s: arp([523, 659, 784, 1047, 1319], 0.06, 0.12, "square", 0.08) },
  { grupo: R, nome: "Conquista", descricao: "Acorde cheio coroado por nota alta.", s: [{ f: 523, d: 0.6, w: "triangle", g: 0.12 }, { f: 659, d: 0.6, w: "triangle", g: 0.12 }, { f: 784, d: 0.6, w: "triangle", g: 0.12 }, { f: 1047, d: 0.5, g: 0.15, at: 0.3 }] },
  { grupo: R, nome: "Fanfarra curta", descricao: "Ta-ta-tááá de metal.", s: [{ f: 392, d: 0.1, w: "sawtooth", g: 0.12, fl: "lowpass", ff: 2500 }, { f: 392, d: 0.1, w: "sawtooth", g: 0.12, at: 0.12, fl: "lowpass", ff: 2500 }, { f: 523, d: 0.45, w: "sawtooth", g: 0.14, at: 0.24, fl: "lowpass", ff: 2500 }] },
  { grupo: R, nome: "Cofrinho", descricao: "Moeda caindo no metal, com eco tremido.", s: [{ n: 1, d: 0.04, g: 0.2, fl: "bandpass", ff: 5000, q: 5 }, { f: 2200, d: 0.35, g: 0.12, at: 0.02, vib: 8, vd: 20 }] },
  { grupo: R, nome: "Estrela", descricao: "Cintilar subindo em duas camadas.", s: [{ f: 2000, to: 3000, d: 0.3, g: 0.1 }, { f: 2500, to: 4000, d: 0.3, g: 0.06, at: 0.1 }] },
  { grupo: R, nome: "Vitória", descricao: "Melodia triunfal com acorde final.", s: [...arp([523, 659, 784], 0.12, 0.14, "triangle"), { f: 1047, d: 0.6, w: "triangle", g: 0.16, at: 0.36 }, { f: 784, d: 0.6, w: "triangle", g: 0.1, at: 0.36 }] },
  // Movimento (7)
  { grupo: M, nome: "Whoosh curto", descricao: "Sopro rápido passando.", s: [{ n: 1, d: 0.25, g: 0.3, fl: "bandpass", ff: 800, fto: 4000, q: 1.5, a: 0.08 }] },
  { grupo: M, nome: "Whoosh longo", descricao: "Vento largo atravessando a tela.", s: [{ n: 1, d: 0.8, g: 0.28, fl: "bandpass", ff: 300, fto: 3000, q: 2, a: 0.3 }] },
  { grupo: M, nome: "Deslizar", descricao: "Arrasto macio, para slider ou gaveta.", s: [{ n: 1, d: 0.4, g: 0.15, fl: "lowpass", ff: 1500, fto: 400, a: 0.05 }, { f: 200, to: 150, d: 0.4, g: 0.08 }] },
  { grupo: M, nome: "Pop", descricao: "Estouro curto e redondo.", s: [{ f: 150, to: 600, d: 0.07, g: 0.35 }] },
  { grupo: M, nome: "Bolha", descricao: "Duas bolhas subindo na água.", s: [{ f: 400, to: 1400, d: 0.12, g: 0.2 }, { f: 500, to: 1600, d: 0.12, g: 0.15, at: 0.1 }] },
  { grupo: M, nome: "Pulso", descricao: "Batida grave dupla, como coração.", s: [{ f: 60, d: 0.3, g: 0.6 }, { f: 55, d: 0.3, g: 0.45, at: 0.35 }] },
  { grupo: M, nome: "Transição", descricao: "Varredura que abre, para troca de cena.", s: [{ f: 110, to: 220, d: 0.6, w: "sawtooth", g: 0.12, fl: "lowpass", ff: 200, fto: 5000 }, { n: 1, d: 0.6, g: 0.06, fl: "highpass", ff: 3000, a: 0.4 }] },
];

function fnName(nome: string) {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
  return "somMr" + base.charAt(0).toUpperCase() + base.slice(1);
}

function buildSnippet(s: SoundDef): string {
  const name = fnName(s.nome);
  return `// ${s.nome} — ${s.descricao}
// Gerado com Web Audio API (sem arquivos). Chame dentro de um clique: ${name}();
function ${name}() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const S = ${JSON.stringify(s.s)};
  const end = (function (ctx, S) {
${ENGINE}
  })(ctx, S);
  setTimeout(() => ctx.close(), (end + 0.3) * 1000);
}`;
}

function SonsPage() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  const play = (i: number) => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    void ctx.resume();
    const end = runSteps(ctx, SOUNDS[i].s);
    setPlaying(i);
    setTimeout(() => setPlaying((p) => (p === i ? null : p)), (end + 0.1) * 1000);
  };

  const copy = async (i: number) => {
    const text = buildSnippet(SOUNDS[i]);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(i);
      toast.success(`Código copiado: "${SOUNDS[i].nome}"`);
      setTimeout(() => setCopied(null), 1500);
    } else {
      window.prompt("Copie o código:", text);
    }
  };

  const grupos = Array.from(new Set(SOUNDS.map((s) => s.grupo)));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Volume2 className="size-3.5" /> Catálogo Privado
        </div>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text-warm">Sons disponíveis</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          50 sons gerados por código, sem arquivos. Clique em ▶ para ouvir e copie o código: é uma função pronta para
          colar em qualquer projeto.
        </p>
      </header>

      {grupos.map((g) => (
        <section key={g} className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{g}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SOUNDS.map((s, i) =>
              s.grupo !== g ? null : (
                <div key={i} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card/40 p-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      #{String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="text-base font-bold">{s.nome}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.descricao}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => play(i)}
                      aria-label={`Ouvir ${s.nome}`}
                      className={`flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-accent ${playing === i ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      <Play className="size-3.5" /> Ouvir
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(i)}
                      aria-label={`Copiar ${s.nome}`}
                      title="Copiar código"
                      className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      {copied === i ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
