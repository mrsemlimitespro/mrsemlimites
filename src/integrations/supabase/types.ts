export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          auth_user_id: string | null
          cidade: string | null
          cliente_id: string | null
          created_at: string
          dispositivo: string | null
          event: string
          id: string
          ip: string | null
          metadata: Json
          navegador: string | null
          pais: string | null
          revendedor_id: string | null
          so: string | null
          user_agent: string | null
        }
        Insert: {
          auth_user_id?: string | null
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          dispositivo?: string | null
          event: string
          id?: string
          ip?: string | null
          metadata?: Json
          navegador?: string | null
          pais?: string | null
          revendedor_id?: string | null
          so?: string | null
          user_agent?: string | null
        }
        Update: {
          auth_user_id?: string | null
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          dispositivo?: string | null
          event?: string
          id?: string
          ip?: string | null
          metadata?: Json
          navegador?: string | null
          pais?: string | null
          revendedor_id?: string | null
          so?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          accent_color: string
          created_at: string
          extension_filename: string | null
          extension_url: string | null
          favicon_url: string | null
          footer_text: string | null
          id: string
          logo_url: string | null
          notification_active: boolean
          notification_message: string | null
          password_hash: string | null
          primary_color: string
          singleton: boolean
          site_name: string
          updated_at: string
          welcome_text: string | null
        }
        Insert: {
          accent_color?: string
          created_at?: string
          extension_filename?: string | null
          extension_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          notification_active?: boolean
          notification_message?: string | null
          password_hash?: string | null
          primary_color?: string
          singleton?: boolean
          site_name?: string
          updated_at?: string
          welcome_text?: string | null
        }
        Update: {
          accent_color?: string
          created_at?: string
          extension_filename?: string | null
          extension_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          notification_active?: boolean
          notification_message?: string | null
          password_hash?: string | null
          primary_color?: string
          singleton?: boolean
          site_name?: string
          updated_at?: string
          welcome_text?: string | null
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          ativo: boolean
          autor: string | null
          capabilities: string[] | null
          categoria: string | null
          compatibilidade: string[] | null
          cover_url: string | null
          created_at: string
          descricao: string | null
          descricao_completa: string | null
          destaque: boolean
          id: string
          instrucoes: string | null
          max_tokens: number | null
          modelo: string | null
          nivel: string | null
          numero: number | null
          oculto: boolean
          provedor: string | null
          subcategoria: string | null
          system_prompt: string
          tags: string[] | null
          temperatura: number | null
          titulo: string
          tools: string[] | null
          updated_at: string
          uso_count: number
          versao: string | null
          visible_mobile: boolean
        }
        Insert: {
          ativo?: boolean
          autor?: string | null
          capabilities?: string[] | null
          categoria?: string | null
          compatibilidade?: string[] | null
          cover_url?: string | null
          created_at?: string
          descricao?: string | null
          descricao_completa?: string | null
          destaque?: boolean
          id?: string
          instrucoes?: string | null
          max_tokens?: number | null
          modelo?: string | null
          nivel?: string | null
          numero?: number | null
          oculto?: boolean
          provedor?: string | null
          subcategoria?: string | null
          system_prompt: string
          tags?: string[] | null
          temperatura?: number | null
          titulo: string
          tools?: string[] | null
          updated_at?: string
          uso_count?: number
          versao?: string | null
          visible_mobile?: boolean
        }
        Update: {
          ativo?: boolean
          autor?: string | null
          capabilities?: string[] | null
          categoria?: string | null
          compatibilidade?: string[] | null
          cover_url?: string | null
          created_at?: string
          descricao?: string | null
          descricao_completa?: string | null
          destaque?: boolean
          id?: string
          instrucoes?: string | null
          max_tokens?: number | null
          modelo?: string | null
          nivel?: string | null
          numero?: number | null
          oculto?: boolean
          provedor?: string | null
          subcategoria?: string | null
          system_prompt?: string
          tags?: string[] | null
          temperatura?: number | null
          titulo?: string
          tools?: string[] | null
          updated_at?: string
          uso_count?: number
          versao?: string | null
          visible_mobile?: boolean
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          ativo: boolean
          autor: string | null
          categoria: string | null
          compatibilidade: string[] | null
          cover_url: string | null
          created_at: string
          descricao: string | null
          destaque: boolean
          downloads: number
          id: string
          mobile_featured: boolean
          mobile_order: number | null
          mostrar_premium: boolean
          mostrar_seguidores: boolean
          mostrar_tv: boolean
          nivel: string | null
          numero: number | null
          oculto: boolean
          popularidade: number
          prompt: string
          status: string | null
          subcategoria: string | null
          tags: string[] | null
          titulo: string
          updated_at: string
          uso_count: number
          versao: string | null
          visible_mobile: boolean
        }
        Insert: {
          ativo?: boolean
          autor?: string | null
          categoria?: string | null
          compatibilidade?: string[] | null
          cover_url?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          downloads?: number
          id?: string
          mobile_featured?: boolean
          mobile_order?: number | null
          mostrar_premium?: boolean
          mostrar_seguidores?: boolean
          mostrar_tv?: boolean
          nivel?: string | null
          numero?: number | null
          oculto?: boolean
          popularidade?: number
          prompt: string
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string
          uso_count?: number
          versao?: string | null
          visible_mobile?: boolean
        }
        Update: {
          ativo?: boolean
          autor?: string | null
          categoria?: string | null
          compatibilidade?: string[] | null
          cover_url?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          downloads?: number
          id?: string
          mobile_featured?: boolean
          mobile_order?: number | null
          mostrar_premium?: boolean
          mostrar_seguidores?: boolean
          mostrar_tv?: boolean
          nivel?: string | null
          numero?: number | null
          oculto?: boolean
          popularidade?: number
          prompt?: string
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          uso_count?: number
          versao?: string | null
          visible_mobile?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          acao: string
          ator_email: string | null
          ator_papel: string | null
          ator_user_id: string | null
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          ip: string | null
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          acao: string
          ator_email?: string | null
          ator_papel?: string | null
          ator_user_id?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          acao?: string
          ator_email?: string | null
          ator_papel?: string | null
          ator_user_id?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      aulas: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          thumbnail_url: string | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          thumbnail_url?: string | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          thumbnail_url?: string | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean
          badge: string | null
          botao_texto: string | null
          cor_botao: string | null
          cor_fundo: string | null
          created_at: string
          descricao: string | null
          fim: string | null
          icone: string | null
          id: string
          imagem_mobile_url: string | null
          imagem_url: string | null
          inicio: string | null
          link: string | null
          ordem: number
          preco: number | null
          preco_promocional: number | null
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          botao_texto?: string | null
          cor_botao?: string | null
          cor_fundo?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_mobile_url?: string | null
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          preco?: number | null
          preco_promocional?: number | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          botao_texto?: string | null
          cor_botao?: string | null
          cor_fundo?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_mobile_url?: string | null
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          preco?: number | null
          preco_promocional?: number | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      carrossel_slides: {
        Row: {
          agendamento: string | null
          ativo: boolean
          badge: string | null
          botao_texto: string | null
          cor_botao: string | null
          cor_fundo: string | null
          created_at: string
          descricao: string | null
          fim: string | null
          icone: string | null
          id: string
          imagem_desktop_url: string | null
          imagem_mobile_url: string | null
          inicio: string | null
          link: string | null
          ordem: number
          preco: number | null
          preco_promocional: number | null
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          agendamento?: string | null
          ativo?: boolean
          badge?: string | null
          botao_texto?: string | null
          cor_botao?: string | null
          cor_fundo?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_desktop_url?: string | null
          imagem_mobile_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          preco?: number | null
          preco_promocional?: number | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          agendamento?: string | null
          ativo?: boolean
          badge?: string | null
          botao_texto?: string | null
          cor_botao?: string | null
          cor_fundo?: string | null
          created_at?: string
          descricao?: string | null
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_desktop_url?: string | null
          imagem_mobile_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          preco?: number | null
          preco_promocional?: number | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          expira_em: string | null
          id: string
          nome: string
          observacoes: string | null
          plano: string | null
          revendedor_id: string | null
          status: string
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expira_em?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          plano?: string | null
          revendedor_id?: string | null
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expira_em?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          plano?: string | null
          revendedor_id?: string | null
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos_movimentos: {
        Row: {
          created_at: string
          delta: number
          id: string
          motivo: string
          referencia_id: string | null
          referencia_tipo: string | null
          revendedor_id: string
          saldo_apos: number
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          motivo: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          revendedor_id: string
          saldo_apos: number
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          motivo?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          revendedor_id?: string
          saldo_apos?: number
        }
        Relationships: [
          {
            foreignKeyName: "creditos_movimentos_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditos_movimentos_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos_packs: {
        Row: {
          ativo: boolean
          badge: string | null
          cor_gradiente: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          cor_gradiente?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          cor_gradiente?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
      }
      dispositivos: {
        Row: {
          bloqueado: boolean
          cidade: string | null
          cliente_id: string | null
          created_at: string
          device_id: string
          id: string
          ip: string | null
          licenca_id: string | null
          metadata: Json
          navegador: string | null
          nome: string | null
          pais: string | null
          primeira_vez: string
          so: string | null
          ultimo_acesso: string
          updated_at: string
          versao: string | null
        }
        Insert: {
          bloqueado?: boolean
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          device_id: string
          id?: string
          ip?: string | null
          licenca_id?: string | null
          metadata?: Json
          navegador?: string | null
          nome?: string | null
          pais?: string | null
          primeira_vez?: string
          so?: string | null
          ultimo_acesso?: string
          updated_at?: string
          versao?: string | null
        }
        Update: {
          bloqueado?: boolean
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          device_id?: string
          id?: string
          ip?: string | null
          licenca_id?: string | null
          metadata?: Json
          navegador?: string | null
          nome?: string | null
          pais?: string | null
          primeira_vez?: string
          so?: string | null
          ultimo_acesso?: string
          updated_at?: string
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispositivos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispositivos_licenca_id_fkey"
            columns: ["licenca_id"]
            isOneToOne: false
            referencedRelation: "licencas"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          created_at: string
          id: string
          item: string
          minimo: number
          observacoes: string | null
          produto_id: string | null
          quantidade: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item: string
          minimo?: number
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item?: string
          minimo?: number
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      imagens: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          id: string
          ordem: number
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      licencas: {
        Row: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          ativada_em?: string | null
          chave: string
          cliente_id?: string | null
          created_at?: string
          device_id?: string | null
          duracao_dias?: number
          email?: string | null
          expira_em?: string | null
          id?: string
          plano?: string | null
          revendedor_id?: string | null
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          ativada_em?: string | null
          chave?: string
          cliente_id?: string | null
          created_at?: string
          device_id?: string | null
          duracao_dias?: number
          email?: string | null
          expira_em?: string | null
          id?: string
          plano?: string | null
          revendedor_id?: string | null
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licencas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licencas_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licencas_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      licencas_eventos: {
        Row: {
          ator_user_id: string | null
          cliente_id: string | null
          created_at: string
          device_id: string | null
          id: string
          ip: string | null
          licenca_id: string
          mensagem: string | null
          metadata: Json
          tipo: string
        }
        Insert: {
          ator_user_id?: string | null
          cliente_id?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          ip?: string | null
          licenca_id: string
          mensagem?: string | null
          metadata?: Json
          tipo: string
        }
        Update: {
          ator_user_id?: string | null
          cliente_id?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          ip?: string | null
          licenca_id?: string
          mensagem?: string | null
          metadata?: Json
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "licencas_eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licencas_eventos_licenca_id_fkey"
            columns: ["licenca_id"]
            isOneToOne: false
            referencedRelation: "licencas"
            referencedColumns: ["id"]
          },
        ]
      }
      logos: {
        Row: {
          ativo: boolean
          created_at: string
          escopo: string
          id: string
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          escopo?: string
          id?: string
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          escopo?: string
          id?: string
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          destino: string
          id: string
          lida_em: string | null
          link: string | null
          mensagem: string
          revendedor_id: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          destino?: string
          id?: string
          lida_em?: string | null
          link?: string | null
          mensagem: string
          revendedor_id?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          destino?: string
          id?: string
          lida_em?: string | null
          link?: string | null
          mensagem?: string
          revendedor_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_access: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          email: string
          gateway: string
          id: string
          notes: string | null
          origin: string
          pack_id: string
          purchased_at: string
          revoked_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email: string
          gateway?: string
          id?: string
          notes?: string | null
          origin?: string
          pack_id: string
          purchased_at?: string
          revoked_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email?: string
          gateway?: string
          id?: string
          notes?: string | null
          origin?: string
          pack_id?: string
          purchased_at?: string
          revoked_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pack_access_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "premium_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_download_logs: {
        Row: {
          browser: string | null
          bytes_sent: number | null
          created_at: string
          device: string | null
          duration_ms: number | null
          error_message: string | null
          file_kind: string | null
          file_name: string | null
          file_size: number | null
          id: string
          ip: string | null
          node_id: string
          origin_provider: string | null
          pack_id: string | null
          pack_slug: string
          referer: string | null
          status: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          bytes_sent?: number | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          error_message?: string | null
          file_kind?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          ip?: string | null
          node_id: string
          origin_provider?: string | null
          pack_id?: string | null
          pack_slug: string
          referer?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          bytes_sent?: number | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          error_message?: string | null
          file_kind?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          ip?: string | null
          node_id?: string
          origin_provider?: string | null
          pack_id?: string | null
          pack_slug?: string
          referer?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          api_key: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          enabled: boolean
          environment: string
          extra: Json
          id: string
          is_default: boolean
          last_test_at: string | null
          last_test_message: string | null
          last_test_status: string | null
          nome: string
          priority: number
          slug: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          enabled?: boolean
          environment?: string
          extra?: Json
          id?: string
          is_default?: boolean
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_status?: string | null
          nome: string
          priority?: number
          slug: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          enabled?: boolean
          environment?: string
          extra?: Json
          id?: string
          is_default?: boolean
          last_test_at?: string | null
          last_test_message?: string | null
          last_test_status?: string | null
          nome?: string
          priority?: number
          slug?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_methods_config: {
        Row: {
          created_at: string
          default_gateway: string | null
          desconto_pix_percent: number
          id: string
          juros_percent: number
          max_parcelas: number
          mensagem_aprovado: string | null
          mensagem_boleto: string | null
          mensagem_cartao: string | null
          mensagem_pendente: string | null
          mensagem_pix: string | null
          mensagem_recusado: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_gateway?: string | null
          desconto_pix_percent?: number
          id?: string
          juros_percent?: number
          max_parcelas?: number
          mensagem_aprovado?: string | null
          mensagem_boleto?: string | null
          mensagem_cartao?: string | null
          mensagem_pendente?: string | null
          mensagem_pix?: string | null
          mensagem_recusado?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_gateway?: string | null
          desconto_pix_percent?: number
          id?: string
          juros_percent?: number
          max_parcelas?: number
          mensagem_aprovado?: string | null
          mensagem_boleto?: string | null
          mensagem_cartao?: string | null
          mensagem_pendente?: string | null
          mensagem_pix?: string | null
          mensagem_recusado?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          aprovado_em: string | null
          cliente_nome: string | null
          created_at: string
          creditos_liberados: number
          external_id: string | null
          gateway_slug: string
          id: string
          metadata: Json
          metodo: string | null
          moeda: string
          pack_id: string | null
          plano_id: string | null
          revendedor_id: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          aprovado_em?: string | null
          cliente_nome?: string | null
          created_at?: string
          creditos_liberados?: number
          external_id?: string | null
          gateway_slug: string
          id?: string
          metadata?: Json
          metodo?: string | null
          moeda?: string
          pack_id?: string | null
          plano_id?: string | null
          revendedor_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          aprovado_em?: string | null
          cliente_nome?: string | null
          created_at?: string
          creditos_liberados?: number
          external_id?: string | null
          gateway_slug?: string
          id?: string
          metadata?: Json
          metodo?: string | null
          moeda?: string
          pack_id?: string | null
          plano_id?: string | null
          revendedor_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "creditos_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "v_revendedor_visao"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_logs: {
        Row: {
          error: string | null
          event_type: string | null
          gateway_slug: string
          id: string
          payload: Json | null
          received_at: string
          status: string
        }
        Insert: {
          error?: string | null
          event_type?: string | null
          gateway_slug: string
          id?: string
          payload?: Json | null
          received_at?: string
          status?: string
        }
        Update: {
          error?: string | null
          event_type?: string | null
          gateway_slug?: string
          id?: string
          payload?: Json | null
          received_at?: string
          status?: string
        }
        Relationships: []
      }
      planos: {
        Row: {
          ativo: boolean
          badge: string | null
          beneficios: Json
          botao_texto: string | null
          cor: string | null
          cor_gradiente: string | null
          created_at: string
          creditos_incluidos: number
          descricao: string | null
          destaque: boolean
          duracao_dias: number
          icone: string | null
          id: string
          imagem_url: string | null
          link: string | null
          nome: string
          ordem: number
          preco: number
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          beneficios?: Json
          botao_texto?: string | null
          cor?: string | null
          cor_gradiente?: string | null
          created_at?: string
          creditos_incluidos?: number
          descricao?: string | null
          destaque?: boolean
          duracao_dias?: number
          icone?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome: string
          ordem?: number
          preco?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          beneficios?: Json
          botao_texto?: string | null
          cor?: string | null
          cor_gradiente?: string | null
          created_at?: string
          creditos_incluidos?: number
          descricao?: string | null
          destaque?: boolean
          duracao_dias?: number
          icone?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome?: string
          ordem?: number
          preco?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      premium_packs: {
        Row: {
          allow_download: boolean
          allow_view: boolean
          autor: string | null
          banner_url: string | null
          capa_url: string | null
          categoria: string
          compatibilidade: string[]
          created_at: string
          descricao_completa: string | null
          descricao_curta: string | null
          destaque: boolean
          downloads: number
          espaco_bytes: number
          galeria: string[]
          icone_url: string | null
          id: string
          is_shareable: boolean
          nome: string
          observacoes: string | null
          og_image_url: string | null
          ordem: number
          popularidade: number
          public_link: string | null
          public_token: string
          qr_code_url: string | null
          qtd_arquivos: number
          sales_platform: string | null
          sales_product_id: string | null
          seo_meta_description: string | null
          seo_meta_title: string | null
          slug: string
          source_metadata: Json
          source_type: string
          source_url_encrypted: Json | null
          status: string
          tags: string[]
          twitter_image_url: string | null
          ultima_atualizacao: string
          updated_at: string
          versao: string | null
          video_url: string | null
          views: number
          visibility_status: string
        }
        Insert: {
          allow_download?: boolean
          allow_view?: boolean
          autor?: string | null
          banner_url?: string | null
          capa_url?: string | null
          categoria?: string
          compatibilidade?: string[]
          created_at?: string
          descricao_completa?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          downloads?: number
          espaco_bytes?: number
          galeria?: string[]
          icone_url?: string | null
          id?: string
          is_shareable?: boolean
          nome: string
          observacoes?: string | null
          og_image_url?: string | null
          ordem?: number
          popularidade?: number
          public_link?: string | null
          public_token?: string
          qr_code_url?: string | null
          qtd_arquivos?: number
          sales_platform?: string | null
          sales_product_id?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          slug: string
          source_metadata?: Json
          source_type?: string
          source_url_encrypted?: Json | null
          status?: string
          tags?: string[]
          twitter_image_url?: string | null
          ultima_atualizacao?: string
          updated_at?: string
          versao?: string | null
          video_url?: string | null
          views?: number
          visibility_status?: string
        }
        Update: {
          allow_download?: boolean
          allow_view?: boolean
          autor?: string | null
          banner_url?: string | null
          capa_url?: string | null
          categoria?: string
          compatibilidade?: string[]
          created_at?: string
          descricao_completa?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          downloads?: number
          espaco_bytes?: number
          galeria?: string[]
          icone_url?: string | null
          id?: string
          is_shareable?: boolean
          nome?: string
          observacoes?: string | null
          og_image_url?: string | null
          ordem?: number
          popularidade?: number
          public_link?: string | null
          public_token?: string
          qr_code_url?: string | null
          qtd_arquivos?: number
          sales_platform?: string | null
          sales_product_id?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          slug?: string
          source_metadata?: Json
          source_type?: string
          source_url_encrypted?: Json | null
          status?: string
          tags?: string[]
          twitter_image_url?: string | null
          ultima_atualizacao?: string
          updated_at?: string
          versao?: string | null
          video_url?: string | null
          views?: number
          visibility_status?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          botao_texto: string | null
          categoria: string | null
          created_at: string
          descricao: string | null
          estoque: number
          id: string
          imagem_url: string | null
          link: string | null
          nome: string
          ordem: number
          preco: number
          status: string
          titulo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          botao_texto?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome: string
          ordem?: number
          preco?: number
          status?: string
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          botao_texto?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          id?: string
          imagem_url?: string | null
          link?: string | null
          nome?: string
          ordem?: number
          preco?: number
          status?: string
          titulo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          ativo: boolean
          banner_desktop_url: string | null
          banner_mobile_url: string | null
          botao_texto: string | null
          cor: string | null
          created_at: string
          desconto_percentual: number | null
          descricao: string | null
          destaque: boolean
          fim: string | null
          icone: string | null
          id: string
          imagem_url: string | null
          inicio: string | null
          link: string | null
          ordem: number
          pack_id: string | null
          plano_id: string | null
          preco_antigo: number | null
          preco_atual: number | null
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          banner_desktop_url?: string | null
          banner_mobile_url?: string | null
          botao_texto?: string | null
          cor?: string | null
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          destaque?: boolean
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          pack_id?: string | null
          plano_id?: string | null
          preco_antigo?: number | null
          preco_atual?: number | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          banner_desktop_url?: string | null
          banner_mobile_url?: string | null
          botao_texto?: string | null
          cor?: string | null
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          destaque?: boolean
          fim?: string | null
          icone?: string | null
          id?: string
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number
          pack_id?: string | null
          plano_id?: string | null
          preco_antigo?: number | null
          preco_atual?: number | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "creditos_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promocoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_classification_learning: {
        Row: {
          categoria_sugerida: string | null
          confianca: number | null
          created_at: string
          features: Json | null
          id: string
          prompt_id: string | null
          subcategoria_sugerida: string | null
          updated_at: string
        }
        Insert: {
          categoria_sugerida?: string | null
          confianca?: number | null
          created_at?: string
          features?: Json | null
          id?: string
          prompt_id?: string | null
          subcategoria_sugerida?: string | null
          updated_at?: string
        }
        Update: {
          categoria_sugerida?: string | null
          confianca?: number | null
          created_at?: string
          features?: Json | null
          id?: string
          prompt_id?: string | null
          subcategoria_sugerida?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_classification_learning_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_favorites: {
        Row: {
          created_at: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_favorites_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_history: {
        Row: {
          action: string
          created_at: string
          id: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      propagandas: {
        Row: {
          ativo: boolean
          botao_texto: string | null
          created_at: string
          fim: string | null
          id: string
          imagem_desktop_url: string | null
          imagem_mobile_url: string | null
          imagem_url: string | null
          inicio: string | null
          link: string | null
          mostrar_premium: boolean
          ordem: number
          posicao: string
          subtitulo: string | null
          tempo_segundos: number | null
          texto: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          botao_texto?: string | null
          created_at?: string
          fim?: string | null
          id?: string
          imagem_desktop_url?: string | null
          imagem_mobile_url?: string | null
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          mostrar_premium?: boolean
          ordem?: number
          posicao?: string
          subtitulo?: string | null
          tempo_segundos?: number | null
          texto?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          botao_texto?: string | null
          created_at?: string
          fim?: string | null
          id?: string
          imagem_desktop_url?: string | null
          imagem_mobile_url?: string | null
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          mostrar_premium?: boolean
          ordem?: number
          posicao?: string
          subtitulo?: string | null
          tempo_segundos?: number | null
          texto?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      revendedores: {
        Row: {
          auth_user_id: string | null
          bloqueado: boolean
          comissao: number | null
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          plano_expira_em: string | null
          plano_id: string | null
          saldo_creditos: number
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          bloqueado?: boolean
          comissao?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          plano_expira_em?: string | null
          plano_id?: string | null
          saldo_creditos?: number
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          bloqueado?: boolean
          comissao?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          plano_expira_em?: string | null
          plano_id?: string | null
          saldo_creditos?: number
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revendedores_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          event_id: string
          event_type: string
          gateway: string
          id: string
          pack_id: string | null
          processed: boolean
          processing_error: string | null
          product_external_id: string | null
          raw_payload: Json
          signature_valid: boolean
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          event_id: string
          event_type: string
          gateway: string
          id?: string
          pack_id?: string | null
          processed?: boolean
          processing_error?: string | null
          product_external_id?: string | null
          raw_payload?: Json
          signature_valid?: boolean
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          event_id?: string
          event_type?: string
          gateway?: string
          id?: string
          pack_id?: string | null
          processed?: boolean
          processing_error?: string | null
          product_external_id?: string | null
          raw_payload?: Json
          signature_valid?: boolean
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_events_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "premium_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          thumbnail_url: string | null
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          thumbnail_url?: string | null
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          thumbnail_url?: string | null
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_metricas: {
        Row: {
          clientes: number | null
          conversao: number | null
          creditos: number | null
          licencas: number | null
          planos: number | null
          produtos: number | null
          receita_ano: number | null
          receita_mes: number | null
          receita_total: number | null
          revendedores: number | null
          transacoes_total: number | null
          vendas: number | null
        }
        Relationships: []
      }
      v_estoque_licencas: {
        Row: {
          ativas: number | null
          bloqueadas: number | null
          canceladas: number | null
          disponiveis: number | null
          expiradas: number | null
          total: number | null
        }
        Relationships: []
      }
      v_revendedor_visao: {
        Row: {
          bloqueado: boolean | null
          clientes: number | null
          email: string | null
          id: string | null
          licencas_ativas: number | null
          licencas_total: number | null
          nome: string | null
          pagamentos: number | null
          plano_expira_em: string | null
          plano_id: string | null
          receita_mes: number | null
          receita_total: number | null
          saldo_creditos: number | null
          status: string | null
        }
        Insert: {
          bloqueado?: boolean | null
          clientes?: never
          email?: string | null
          id?: string | null
          licencas_ativas?: never
          licencas_total?: never
          nome?: string | null
          pagamentos?: never
          plano_expira_em?: string | null
          plano_id?: string | null
          receita_mes?: never
          receita_total?: never
          saldo_creditos?: number | null
          status?: string | null
        }
        Update: {
          bloqueado?: boolean | null
          clientes?: never
          email?: string | null
          id?: string | null
          licencas_ativas?: never
          licencas_total?: never
          nome?: string | null
          pagamentos?: never
          plano_expira_em?: string | null
          plano_id?: string | null
          receita_mes?: never
          receita_total?: never
          saldo_creditos?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revendedores_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_credits: {
        Args: {
          _delta: number
          _motivo: string
          _ref_id?: string
          _ref_tipo?: string
          _revendedor_id: string
        }
        Returns: number
      }
      admin_password_configured: { Args: never; Returns: boolean }
      approve_pagamento: { Args: { _pagamento_id: string }; Returns: undefined }
      atribuir_licenca_cliente: {
        Args: { _chave: string; _cliente_id: string; _email: string }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancelar_licenca: {
        Args: { _licenca_id: string; _motivo?: string }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_revendedor_profile: {
        Args: { _nome?: string; _telefone?: string }
        Returns: string
      }
      criar_notificacao: {
        Args: {
          _categoria?: string
          _link?: string
          _mensagem: string
          _revendedor_id?: string
          _tipo?: string
          _titulo: string
          _user_id?: string
        }
        Returns: string
      }
      current_revendedor_id: { Args: never; Returns: string }
      expirar_licencas_vencidas: { Args: never; Returns: number }
      gerar_chave_licenca: { Args: never; Returns: string }
      gerar_licencas: {
        Args: {
          _duracao_dias?: number
          _quantidade: number
          _revendedor_id?: string
        }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_revendedor: { Args: { _uid: string }; Returns: boolean }
      notificar_licencas_expirando: { Args: never; Returns: number }
      reativar_licenca: {
        Args: { _licenca_id: string }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      renovar_licenca: {
        Args: { _dias: number; _licenca_id: string }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resetar_device_licenca: {
        Args: { _licenca_id: string }
        Returns: {
          ativada_em: string | null
          chave: string
          cliente_id: string | null
          created_at: string
          device_id: string | null
          duracao_dias: number
          email: string | null
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "licencas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_admin_password: {
        Args: { _current_password?: string; _new_password: string }
        Returns: boolean
      }
      validar_licenca: {
        Args: { _chave: string; _device_id?: string; _email: string }
        Returns: Json
      }
      verify_admin_password: { Args: { _password: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
