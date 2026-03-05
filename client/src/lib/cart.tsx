import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useContent } from "@/hooks/use-content";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  isReservation?: boolean;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  addReservation: () => void;
  removeItem: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "ttw-cart";

const DEFAULT_RESERVATION_PRICE = 60;

function normalizeItemPrice(item: CartItem): CartItem {
  const p = typeof item.price === "number" && Number.isFinite(item.price)
    ? item.price
    : Math.max(0, Number(item.price) || (item.isReservation ? DEFAULT_RESERVATION_PRICE : 0));
  return { ...item, price: p };
}

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: CartItem[] = stored ? JSON.parse(stored) : [];
    return items.map(normalizeItemPrice);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function itemKey(item: { productId: number; size?: string; color?: string }) {
  return `${item.productId}-${item.size || ""}-${item.color || ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const { config } = useContent();

  const reservationItem = useMemo((): Omit<CartItem, "quantity"> | null => {
    const r = config?.reservation;
    if (!r) return null;
    const usdToCrc = Math.max(1, config?.pricing?.usdToCrc ?? 500);
    let price = typeof r.price === "number" && Number.isFinite(r.price)
      ? r.price
      : Math.max(0, Number(r.price) || 60);
    if (price >= 1000) {
      price = Math.round(price / usdToCrc);
    }
    return {
      productId: -1,
      slug: "reserva-sesion-tattoo",
      name: r.name ?? "Reserva de sesión de tattoo",
      price,
      image: r.imageUrl ?? "",
      isReservation: true,
    };
  }, [config?.reservation, config?.pricing?.usdToCrc]);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Sync reservation item prices with current config (e.g. after admin changes price)
  useEffect(() => {
    const r = config?.reservation;
    if (!r) return;
    const usdToCrc = Math.max(1, config?.pricing?.usdToCrc ?? 500);
    let price = typeof r.price === "number" && Number.isFinite(r.price)
      ? r.price
      : Math.max(0, Number(r.price) || DEFAULT_RESERVATION_PRICE);
    if (price >= 1000) price = Math.round(price / usdToCrc);
    setItems((prev) =>
      prev.some((i) => i.isReservation)
        ? prev.map((i) => (i.isReservation ? { ...i, price } : i))
        : prev
    );
  }, [config?.reservation?.price]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const key = itemKey(item);
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback(
    (productId: number, size?: string, color?: string) => {
      const key = itemKey({ productId, size, color });
      setItems((prev) => prev.filter((i) => itemKey(i) !== key));
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number, size?: string, color?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }
      const key = itemKey({ productId, size, color });
      setItems((prev) =>
        prev.map((i) => (itemKey(i) === key ? { ...i, quantity } : i))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const addReservation = useCallback(() => {
    if (!reservationItem) return;
    setItems([{ ...reservationItem, quantity: 1 }]);
  }, [reservationItem]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * i.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      addReservation,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      items,
      addItem,
      addReservation,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
