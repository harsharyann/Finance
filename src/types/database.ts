export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string
          role: 'user' | 'admin'
          is_locked: boolean
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string
          role?: 'user' | 'admin'
          is_locked?: boolean
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string
          role?: 'user' | 'admin'
          is_locked?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          payment_method: string | null
          note: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          payment_method?: string | null
          note?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          payment_method?: string | null
          note?: string | null
          date?: string
          created_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string
          due_date: string
          status: 'upcoming' | 'paid' | 'due'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category: string
          due_date: string
          status?: 'upcoming' | 'paid' | 'due'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string
          due_date?: string
          status?: 'upcoming' | 'paid' | 'due'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
