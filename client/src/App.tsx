import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  AdminAuthProvider,
  AdminRouteGuard,
  AdminDashboardPage,
} from "@/admin";
import { AdminConfigPage } from "@/admin/pages/admin-config";
import { AdminNavCardsPage } from "@/admin/pages/admin-nav-cards";
import { AdminGalleryPage } from "@/admin/pages/admin-gallery";
import { AdminGalleryFormPage } from "@/admin/pages/admin-gallery-form-page";
import { AdminProductsPage } from "@/admin/pages/admin-products";
import { AdminProductFormPage } from "@/admin/pages/admin-product-form-page";
import { AdminOrdersPage } from "@/admin/pages/admin-orders";
import { AdminOrderDetailPage } from "@/admin/pages/admin-order-detail";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import OrderStatus from "@/pages/OrderStatus";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AdminThemeEffect() {
  const [location] = useLocation();
  useEffect(() => {
    if (location.startsWith("/admin")) {
      document.documentElement.setAttribute("data-admin", "true");
    } else {
      document.documentElement.removeAttribute("data-admin");
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:text-sm"
      >
        Saltar al contenido
      </a>
      <ScrollToTop />
      <AdminThemeEffect />
      <Switch>
        <Route path="/admin/orders/:id" component={AdminOrderDetailWrapper} />
        <Route path="/admin/products/new" component={AdminProductFormWrapper} />
        <Route path="/admin/products/:id" component={AdminProductFormWrapper} />
        <Route path="/admin/gallery/new" component={AdminGalleryFormWrapper} />
        <Route path="/admin/gallery/:id" component={AdminGalleryFormWrapper} />
        <Route path="/admin/config" component={AdminWrapper} />
        <Route path="/admin/nav-cards" component={AdminWrapper} />
        <Route path="/admin/orders" component={AdminWrapper} />
        <Route path="/admin/gallery" component={AdminWrapper} />
        <Route path="/admin/products" component={AdminWrapper} />
        <Route path="/admin" component={AdminWrapper} />
        <Route path="/" component={Home} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/:slug" component={ProductDetail} />
        <Route path="/order/:orderNumber" component={OrderStatus} />
        <Route path="/cart" component={Cart} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AdminWrapper() {
  const [path] = useLocation();
  const routeMap: Record<string, React.ComponentType> = {
    "/admin": AdminDashboardPage,
    "/admin/config": AdminConfigPage,
    "/admin/nav-cards": AdminNavCardsPage,
    "/admin/gallery": AdminGalleryPage,
    "/admin/products": AdminProductsPage,
    "/admin/orders": AdminOrdersPage,
  };
  const Component = routeMap[path] ?? AdminDashboardPage;

  return (
    <AdminRouteGuard>
      <Component />
    </AdminRouteGuard>
  );
}

function AdminProductFormWrapper() {
  return (
    <AdminRouteGuard>
      <AdminProductFormPage />
    </AdminRouteGuard>
  );
}

function AdminOrderDetailWrapper() {
  return (
    <AdminRouteGuard>
      <AdminOrderDetailPage />
    </AdminRouteGuard>
  );
}

function AdminGalleryFormWrapper() {
  return (
    <AdminRouteGuard>
      <AdminGalleryFormPage />
    </AdminRouteGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminAuthProvider>
            <CartProvider>
              <Router />
              <Toaster />
            </CartProvider>
          </AdminAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
