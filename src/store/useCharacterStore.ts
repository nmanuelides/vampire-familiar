import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { VTMCharacter } from "../types/vtm";

interface CharacterState {
  characters: VTMCharacter[];
  loading: boolean;
  error: string | null;
  fetchCharacters: (userId: string) => Promise<void>;
  addCharacter: (character: VTMCharacter) => Promise<VTMCharacter | null>;
  updateCharacter: (
    id: string,
    character: Partial<VTMCharacter>,
  ) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  subscribeToCharacterUpdates: (id: string) => () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  loading: false,
  error: null,

  fetchCharacters: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase.from("characters").select("*");

      // Shared Visibility Logic:
      // If the user is magatsu82@gmail.com, they see everything.
      // Otherwise, they only see their own.
      const userEmail = (await supabase.auth.getUser()).data.user?.email;

      if (
        userEmail !== "magatsu82@gmail.com" &&
        userEmail !== "magatsu83@gmail.com"
      ) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      set({ characters: data as VTMCharacter[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addCharacter: async (
    character: VTMCharacter,
  ): Promise<VTMCharacter | null> => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("characters")
        .insert([character])
        .select()
        .single();

      if (error) throw error;

      const newChar = data as VTMCharacter;
      set({
        characters: [newChar, ...get().characters],
        loading: false,
      });
      return newChar;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateCharacter: async (id: string, updates: Partial<VTMCharacter>) => {
    try {
      // Optimistic update
      const previousChars = get().characters;
      set({
        characters: previousChars.map((c) =>
          c.id === id ? { ...c, ...updates } : c,
        ),
      });

      console.log("[updateCharacter] Sending to Supabase:", { id, updates });

      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) {
        console.error("[updateCharacter] Supabase error:", error);
        set({ characters: previousChars });
        throw error;
      }

      if (!data || data.length === 0) {
        console.error(
          "[updateCharacter] RLS Blocked the update! 0 rows affected.",
        );
        set({ characters: previousChars });
        throw new Error(
          "No tienes permisos para actualizar este personaje en la base de datos.",
        );
      }

      console.log("[updateCharacter] Success! Rows affected:", data.length);
    } catch (err: any) {
      console.error("[updateCharacter] Exception:", err);
      set({ error: err.message });
    }
  },

  deleteCharacter: async (id: string) => {
    try {
      // Optimistic update
      const previousChars = get().characters;
      set({ characters: previousChars.filter((c) => c.id !== id) });

      const { error } = await supabase.from("characters").delete().eq("id", id);

      if (error) {
        set({ characters: previousChars });
        throw error;
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  subscribeToCharacterUpdates: (id: string) => {
    const channel = supabase
      .channel(`character-updates-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "characters",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("[Realtime] Character update received:", payload.new);
          const updates = payload.new as Partial<VTMCharacter>;
          set((state) => ({
            characters: state.characters.map((c) =>
              c.id === id ? { ...c, ...updates } : c,
            ),
          }));
        },
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for ${id}:`, status);
      });

    return () => {
      console.log("[Realtime] Unsubscribing from character:", id);
      supabase.removeChannel(channel);
    };
  },
}));
