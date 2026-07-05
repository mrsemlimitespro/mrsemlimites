import type { ComponentType, SVGProps } from "react";
import {
  KeyRound,
  Users,
  Package,
  Coins,
  Percent,
  Image as ImageIcon,
  Video,
  GraduationCap,
  Megaphone,
  LayoutGrid,
} from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "datetime"
  | "select"
  | "select_from_table"
  | "image"
  | "media";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  fromTable?: { table: string; labelKey: string; valueKey?: string };
  placeholder?: string;
  step?: number;
  helperText?: string;
};

export type Resource = {
  key: string;
  label: string;
  singular: string;
  table: string;
  icon: IconType;
  fields: Field[];
  listColumns: { key: string; label: string; format?: "text" | "boolean" | "date" | "currency" | "number" }[];
  orderBy?: { column: string; ascending: boolean };
  searchColumns?: string[];
};

const statusOptions = [
  { value: "ativa", label: "Ativa" },
  { value: "suspensa", label: "Suspensa" },
  { value: "expirada", label: "Expirada" },
  { value: "teste", label: "Teste" },
];

export const resources: Resource[] = [
  {
    key: "licencas",
    label: "Licenças",
    singular: "Licença",
    table: "licencas",
    icon: KeyRound,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["chave", "plano"],
    fields: [
      { key: "chave", label: "Chave", type: "text", required: true },
      {
        key: "cliente_id",
        label: "Cliente",
        type: "select_from_table",
        fromTable: { table: "clientes", labelKey: "nome" },
      },
      { key: "plano", label: "Plano", type: "text", placeholder: "Ex.: Premium anual" },
      { key: "status", label: "Status", type: "select", options: statusOptions, required: true },
      { key: "expira_em", label: "Expira em", type: "datetime" },
    ],
    listColumns: [
      { key: "chave", label: "Chave" },
      { key: "plano", label: "Plano" },
      { key: "status", label: "Status" },
      { key: "expira_em", label: "Expira", format: "date" },
      { key: "created_at", label: "Criada", format: "date" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    singular: "Cliente",
    table: "clientes",
    icon: Users,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["nome", "email", "telefone"],
    fields: [
      { key: "nome", label: "Nome", type: "text", required: true },
      { key: "email", label: "E-mail", type: "text" },
      { key: "telefone", label: "Telefone", type: "text" },
      { key: "observacoes", label: "Observações", type: "textarea" },
    ],
    listColumns: [
      { key: "nome", label: "Nome" },
      { key: "email", label: "E-mail" },
      { key: "telefone", label: "Telefone" },
      { key: "created_at", label: "Criado", format: "date" },
    ],
  },
  {
    key: "produtos",
    label: "Produtos",
    singular: "Produto",
    table: "produtos",
    icon: Package,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["nome"],
    fields: [
      { key: "nome", label: "Nome", type: "text", required: true },
      { key: "descricao", label: "Descrição", type: "textarea" },
      { key: "preco", label: "Preço (R$)", type: "number", step: 0.01, required: true },
      { key: "imagem_url", label: "Imagem", type: "image" },
      { key: "ativo", label: "Ativo", type: "boolean" },
    ],
    listColumns: [
      { key: "nome", label: "Nome" },
      { key: "preco", label: "Preço", format: "currency" },
      { key: "ativo", label: "Ativo", format: "boolean" },
      { key: "created_at", label: "Criado", format: "date" },
    ],
  },
  {
    key: "creditos",
    label: "Créditos",
    singular: "Pacote de créditos",
    table: "creditos_packs",
    icon: Coins,
    orderBy: { column: "quantidade", ascending: true },
    searchColumns: ["nome"],
    fields: [
      { key: "nome", label: "Nome", type: "text", required: true },
      { key: "quantidade", label: "Quantidade de créditos", type: "number", required: true },
      { key: "preco", label: "Preço (R$)", type: "number", step: 0.01, required: true },
      { key: "descricao", label: "Descrição", type: "textarea" },
      { key: "ativo", label: "Ativo", type: "boolean" },
    ],
    listColumns: [
      { key: "nome", label: "Nome" },
      { key: "quantidade", label: "Qtd.", format: "number" },
      { key: "preco", label: "Preço", format: "currency" },
      { key: "ativo", label: "Ativo", format: "boolean" },
    ],
  },
  {
    key: "promocoes",
    label: "Promoções",
    singular: "Promoção",
    table: "promocoes",
    icon: Percent,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["titulo"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "descricao", label: "Descrição", type: "textarea" },
      { key: "desconto_percentual", label: "Desconto (%)", type: "number", step: 0.5 },
      { key: "inicio", label: "Início", type: "datetime" },
      { key: "fim", label: "Fim", type: "datetime" },
      { key: "ativo", label: "Ativa", type: "boolean" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "desconto_percentual", label: "Desconto %", format: "number" },
      { key: "ativo", label: "Ativa", format: "boolean" },
      { key: "fim", label: "Fim", format: "date" },
    ],
  },
  {
    key: "banners",
    label: "Banners",
    singular: "Banner",
    table: "banners",
    icon: LayoutGrid,
    orderBy: { column: "ordem", ascending: true },
    searchColumns: ["titulo"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "imagem_url", label: "Imagem", type: "image" },
      { key: "link", label: "Link (URL)", type: "text" },
      { key: "ordem", label: "Ordem", type: "number" },
      { key: "ativo", label: "Ativo", type: "boolean" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "ordem", label: "Ordem", format: "number" },
      { key: "ativo", label: "Ativo", format: "boolean" },
    ],
  },
  {
    key: "imagens",
    label: "Imagens",
    singular: "Imagem",
    table: "imagens",
    icon: ImageIcon,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["titulo", "categoria"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "url", label: "Arquivo", type: "image", required: true },
      { key: "categoria", label: "Categoria", type: "text" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "categoria", label: "Categoria" },
      { key: "created_at", label: "Enviada", format: "date" },
    ],
  },
  {
    key: "videos",
    label: "Vídeos",
    singular: "Vídeo",
    table: "videos",
    icon: Video,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["titulo"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "url", label: "URL do vídeo", type: "text", required: true, placeholder: "https://... ou cole a URL do YouTube" },
      { key: "thumbnail_url", label: "Thumbnail", type: "image" },
      { key: "descricao", label: "Descrição", type: "textarea" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "created_at", label: "Criado", format: "date" },
    ],
  },
  {
    key: "aulas",
    label: "Aulas",
    singular: "Aula",
    table: "aulas",
    icon: GraduationCap,
    orderBy: { column: "ordem", ascending: true },
    searchColumns: ["titulo"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "descricao", label: "Descrição", type: "textarea" },
      { key: "video_url", label: "URL do vídeo", type: "text" },
      { key: "thumbnail_url", label: "Thumbnail", type: "image" },
      { key: "ordem", label: "Ordem", type: "number" },
      { key: "ativo", label: "Ativa", type: "boolean" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "ordem", label: "Ordem", format: "number" },
      { key: "ativo", label: "Ativa", format: "boolean" },
    ],
  },
  {
    key: "propagandas",
    label: "Propagandas",
    singular: "Propaganda",
    table: "propagandas",
    icon: Megaphone,
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["titulo"],
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "texto", label: "Texto", type: "textarea" },
      { key: "imagem_url", label: "Imagem", type: "image" },
      { key: "link", label: "Link (URL)", type: "text" },
      { key: "ativo", label: "Ativa", type: "boolean" },
    ],
    listColumns: [
      { key: "titulo", label: "Título" },
      { key: "ativo", label: "Ativa", format: "boolean" },
      { key: "created_at", label: "Criada", format: "date" },
    ],
  },
];

export const resourceByKey = new Map(resources.map((r) => [r.key, r]));
