import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { VTMCharacter } from "../types/vtm";

interface CharacterState {
  characters: VTMCharacter[];
  loading: boolean;
  error: string | null;
  fetchCharacters: (userId: string) => Promise<void>;
  addCharacter: (character: VTMCharacter) => Promise<void>;
  updateCharacter: (
    id: string,
    character: Partial<VTMCharacter>,
  ) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  loading: false,
  error: null,

  fetchCharacters: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ characters: data as VTMCharacter[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addCharacter: async (character: VTMCharacter) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("characters")
        .insert([character])
        .select()
        .single();

      if (error) throw error;
      set({
        characters: [data as VTMCharacter, ...get().characters],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
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

      const { error } = await supabase
        .from("characters")
        .update(updates)
        .eq("id", id);

      if (error) {
        // Revert on error
        set({ characters: previousChars });
        throw error;
      }
    } catch (err: any) {
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
}));
