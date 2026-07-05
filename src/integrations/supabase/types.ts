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
          cliente_id: string | null
          created_at: string
          event: string
          id: string
          ip: string | null
          metadata: Json
          revendedor_id: string | null
          user_agent: string | null
        }
        Insert: {
          auth_user_id?: string | null
          cliente_id?: string | null
          created_at?: string
          event: string
          id?: string
          ip?: string | null
          metadata?: Json
          revendedor_id?: string | null
          user_agent?: string | null
        }
        Update: {
          auth_user_id?: string | null
          cliente_id?: string | null
          created_at?: string
          event?: string
          id?: string
          ip?: string | null
          metadata?: Json
          revendedor_id?: string | null
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
        ]
      }
      admin_settings: {
        Row: {
          accent_color: string
          created_at: string
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
          created_at: string
          id: string
          imagem_url: string | null
          link: string | null
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number
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
        ]
      }
      creditos_packs: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
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
          categoria: string | null
          created_at: string
          id: string
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      licencas: {
        Row: {
          chave: string
          cliente_id: string | null
          created_at: string
          expira_em: string | null
          id: string
          plano: string | null
          revendedor_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          chave: string
          cliente_id?: string | null
          created_at?: string
          expira_em?: string | null
          id?: string
          plano?: string | null
          revendedor_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          chave?: string
          cliente_id?: string | null
          created_at?: string
          expira_em?: string | null
          id?: string
          plano?: string | null
          revendedor_id?: string | null
          status?: string
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
          created_at: string
          destino: string
          id: string
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          destino?: string
          id?: string
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          destino?: string
          id?: string
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string
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
          created_at: string
          creditos_incluidos: number
          descricao: string | null
          duracao_dias: number
          id: string
          nome: string
          preco: number
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          creditos_incluidos?: number
          descricao?: string | null
          duracao_dias?: number
          id?: string
          nome: string
          preco?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          creditos_incluidos?: number
          descricao?: string | null
          duracao_dias?: number
          id?: string
          nome?: string
          preco?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          ativo: boolean
          created_at: string
          desconto_percentual: number | null
          descricao: string | null
          fim: string | null
          id: string
          inicio: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      propagandas: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          imagem_url: string | null
          link: string | null
          texto: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          texto?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
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
      [_ in never]: never
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
      approve_pagamento: { Args: { _pagamento_id: string }; Returns: undefined }
      create_revendedor_profile: {
        Args: { _nome?: string; _telefone?: string }
        Returns: string
      }
      current_revendedor_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_revendedor: { Args: { _uid: string }; Returns: boolean }
      set_admin_password: {
        Args: { _current_password?: string; _new_password: string }
        Returns: boolean
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
