
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "apelidos": {
                  Row: {
                    "criado_em": string,"id": string,"jogador_id": string,"texto": string
                  }
                  ComputedFields: never
                  Insert: {
                    "criado_em"?: string,"id"?: string,"jogador_id": string,"texto": string
                  }
                  Update: {
                    "criado_em"?: string,"id"?: string,"jogador_id"?: string,"texto"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "apelidos_jogador_id_fkey"
      columns: ["jogador_id"]
isOneToOne: false
      referencedRelation: "jogadores"
      referencedColumns: ["id"]
    }
                  ]
                },"configuracoes": {
                  Row: {
                    "avatar_url": string | null,"dia_semana": number,"formato_padrao": string,"horario_padrao": string,"id": boolean,"local_padrao": string,"max_cinco_estrelas": number,"max_jogos_seguidos": number,"nome_pelada": string,"tempo_jogo": number
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"dia_semana"?: number,"formato_padrao"?: string,"horario_padrao"?: string,"id"?: boolean,"local_padrao"?: string,"max_cinco_estrelas"?: number,"max_jogos_seguidos"?: number,"nome_pelada"?: string,"tempo_jogo"?: number
                  }
                  Update: {
                    "avatar_url"?: string | null,"dia_semana"?: number,"formato_padrao"?: string,"horario_padrao"?: string,"id"?: boolean,"local_padrao"?: string,"max_cinco_estrelas"?: number,"max_jogos_seguidos"?: number,"nome_pelada"?: string,"tempo_jogo"?: number
                  }
                  Relationships: [
                    
                  ]
                },"jogadores": {
                  Row: {
                    "ativo": boolean,"criado_em": string,"estrelas": number,"goleiro": boolean,"id": string,"nome": string,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: boolean,"criado_em"?: string,"estrelas": number,"goleiro"?: boolean,"id"?: string,"nome": string,"tipo"?: string
                  }
                  Update: {
                    "ativo"?: boolean,"criado_em"?: string,"estrelas"?: number,"goleiro"?: boolean,"id"?: string,"nome"?: string,"tipo"?: string
                  }
                  Relationships: [
                    
                  ]
                },"peladas": {
                  Row: {
                    "criada_em": string,"data": string,"duracao_min": number | null,"formato": string | null,"horario": string,"id": string,"local": string,"sorteada_em": string | null,"times": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "criada_em"?: string,"data": string,"duracao_min"?: number | null,"formato"?: string | null,"horario": string,"id"?: string,"local": string,"sorteada_em"?: string | null,"times"?: Json | null
                  }
                  Update: {
                    "criada_em"?: string,"data"?: string,"duracao_min"?: number | null,"formato"?: string | null,"horario"?: string,"id"?: string,"local"?: string,"sorteada_em"?: string | null,"times"?: Json | null
                  }
                  Relationships: [
                    
                  ]
                },"presencas": {
                  Row: {
                    "id": string,"jogador_id": string,"marcado_presente_em": string | null,"origem": string,"pelada_id": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"jogador_id": string,"marcado_presente_em"?: string | null,"origem": string,"pelada_id": string,"status"?: string
                  }
                  Update: {
                    "id"?: string,"jogador_id"?: string,"marcado_presente_em"?: string | null,"origem"?: string,"pelada_id"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "presencas_jogador_id_fkey"
      columns: ["jogador_id"]
isOneToOne: false
      referencedRelation: "jogadores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "presencas_pelada_id_fkey"
      columns: ["pelada_id"]
isOneToOne: false
      referencedRelation: "peladas"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "identidade_pelada":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar_url": string,"nome_pelada": string
            }[]
                           },
"normalizar_nome":
{ Args: { "texto": string }; Returns: string
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
