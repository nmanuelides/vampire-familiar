import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { VTMItem } from "../types/vtm";

interface ItemState {
  items: VTMItem[];
  loading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  createItem: (item: Omit<VTMItem, "id" | "user_id" | "created_at">) => Promise<VTMItem | null>;
  updateItem: (id: string, updates: Partial<VTMItem>) => Promise<VTMItem | null>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      set({ items: data as VTMItem[], loading: false });
    } catch (err: any) {
      console.error("[fetchItems] Error:", err);
      set({ error: err.message, loading: false });
    }
  },

  createItem: async (item) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Debes iniciar sesión para crear items.");

      const newItemData = {
        ...item,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("items")
        .insert(newItemData)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const currentItems = get().items;
      set({ items: [...currentItems, data as VTMItem], loading: false });

      return data as VTMItem;
    } catch (err: any) {
      console.error("[createItem] Error:", err);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateItem: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const currentItems = get().items;
      set({
        items: currentItems.map((item) => (item.id === id ? { ...item, ...data } : item)),
        loading: false,
      });

      return data as VTMItem;
    } catch (err: any) {
      console.error("[updateItem] Error:", err);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  deleteItem: async (id: string) => {
    try {
      // Optimistic update
      const previousItems = get().items;
      set({ items: previousItems.filter((i) => i.id !== id) });

      const { error } = await supabase.from("items").delete().eq("id", id);

      if (error) {
        set({ items: previousItems });
        throw error;
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null }),
}));
