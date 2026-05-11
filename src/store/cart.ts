import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantLabel?: string) => void;
  updateQuantity: (id: string, quantity: number, variantLabel?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const key = item.id + (item.variantLabel || "");
        const existing = get().items.find(
          (i) => i.id === item.id && (i.variantLabel || "") === (item.variantLabel || "")
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id && (i.variantLabel || "") === (item.variantLabel || "")
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            isOpen: true,
          }));
        } else {
          set((state) => ({
            items: [...state.items, item],
            isOpen: true,
          }));
        }
      },

      removeItem: (id, variantLabel) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && (i.variantLabel || "") === (variantLabel || ""))
          ),
        }));
      },

      updateQuantity: (id, quantity, variantLabel) => {
        if (quantity <= 0) {
          get().removeItem(id, variantLabel);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && (i.variantLabel || "") === (variantLabel || "")
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
