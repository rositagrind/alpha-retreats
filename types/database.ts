export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Relationships: [];
      };
      retreats: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          description: string | null;
          location: string;
          country: string;
          duration_days: number;
          start_date: string | null;
          end_date: string | null;
          max_capacity: number;
          spots_remaining: number;
          price_euros: number;
          deposit_euros: number;
          status: 'draft' | 'coming_soon' | 'available' | 'sold_out' | 'completed';
          featured: boolean;
          activity_tags: string[];
          itinerary: Json;
          included: string[];
          not_included: string[];
          images: string[];
          hero_image: string | null;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          description?: string | null;
          location: string;
          country: string;
          duration_days: number;
          start_date?: string | null;
          end_date?: string | null;
          max_capacity?: number;
          spots_remaining?: number;
          price_euros: number;
          deposit_euros?: number;
          status?: 'draft' | 'coming_soon' | 'available' | 'sold_out' | 'completed';
          featured?: boolean;
          activity_tags?: string[];
          itinerary?: Json;
          included?: string[];
          not_included?: string[];
          images?: string[];
          hero_image?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          tagline?: string | null;
          description?: string | null;
          location?: string;
          country?: string;
          duration_days?: number;
          start_date?: string | null;
          end_date?: string | null;
          max_capacity?: number;
          spots_remaining?: number;
          price_euros?: number;
          deposit_euros?: number;
          status?: 'draft' | 'coming_soon' | 'available' | 'sold_out' | 'completed';
          featured?: boolean;
          activity_tags?: string[];
          itinerary?: Json;
          included?: string[];
          not_included?: string[];
          images?: string[];
          hero_image?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          retreat_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          spots: number;
          total_euros: number;
          deposit_euros: number;
          status: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded';
          stripe_session_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          retreat_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          spots?: number;
          total_euros: number;
          deposit_euros: number;
          status?: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded';
          stripe_session_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          retreat_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          spots?: number;
          total_euros?: number;
          deposit_euros?: number;
          status?: 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'refunded';
          stripe_session_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      corporate_enquiries: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          team_size: number | null;
          preferred_dates: string | null;
          goals: string | null;
          status: 'new' | 'in_progress' | 'proposal_sent' | 'closed';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          team_size?: number | null;
          preferred_dates?: string | null;
          goals?: string | null;
          status?: 'new' | 'in_progress' | 'proposal_sent' | 'closed';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          team_size?: number | null;
          preferred_dates?: string | null;
          goals?: string | null;
          status?: 'new' | 'in_progress' | 'proposal_sent' | 'closed';
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          read: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          read?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          read?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Retreat = Database['public']['Tables']['retreats']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Waitlist = Database['public']['Tables']['waitlist']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type CorporateEnquiry = Database['public']['Tables']['corporate_enquiries']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};
