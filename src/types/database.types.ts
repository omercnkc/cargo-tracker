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
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courier_companies: {
        Row: {
          id: string
          name: string
          code: string
          logo_url: string | null
          website: string | null
          tracking_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          logo_url?: string | null
          website?: string | null
          tracking_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          logo_url?: string | null
          website?: string | null
          tracking_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          tracking_number: string
          title: string | null
          sender: string | null
          receiver: string | null
          current_status: string | null
          last_location: string | null
          estimated_delivery: string | null
          delivered_at: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          tracking_number: string
          title?: string | null
          sender?: string | null
          receiver?: string | null
          current_status?: string | null
          last_location?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          tracking_number?: string
          title?: string | null
          sender?: string | null
          receiver?: string | null
          current_status?: string | null
          last_location?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shipment_events: {
        Row: {
          id: string
          shipment_id: string
          status: string
          description: string | null
          location: string | null
          event_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shipment_id: string
          status: string
          description?: string | null
          location?: string | null
          event_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shipment_id?: string
          status?: string
          description?: string | null
          location?: string | null
          event_time?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          shipment_id: string | null
          title: string | null
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shipment_id?: string | null
          title?: string | null
          body?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shipment_id?: string | null
          title?: string | null
          body?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          shipment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shipment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shipment_id?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          language: string
          theme: string
          notifications_enabled: boolean
          biometric_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          language?: string
          theme?: string
          notifications_enabled?: boolean
          biometric_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          language?: string
          theme?: string
          notifications_enabled?: boolean
          biometric_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
