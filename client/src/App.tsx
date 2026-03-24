import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdminAuthProvider, AdminRouteGuard } from "@/admin";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import OrderStatus from "@/pages/OrderStatus";
import NotFound from "@/pages/not-found";

// Lazy-load admin pages — not needed for public visitors
const AdminDashboardPage = lazy(() => import("@/admin/pages/admin-dashboard").then(m => ({ default: m.AdminDashboardPage })));
const AdminConfigPage = lazy(() => import("@/admin/pages/admin-config").then(m => ({ default: m.AdminConfigPage })));
const AdminNavCardsPage = lazy(() => import("@/admin/pages/admin-nav-cards").then(m => ({ default: m.AdminNavCardsPage })));
const AdminGalleryPage = lazy(() => import("@/admin/pages/admin-gallery").then(m => ({ default: m.AdminGalleryPage })));
const AdminGalleryFormPage = lazy(() => import("@/admin/pages/admin-gallery-form-page").then(m => ({ default: m.AdminGalleryFormPage })));
const AdminProductsPage = lazy(() => import("@/admin/pages/admin-products").then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import("@/admin/pages/admin-product-form-page").then(m => ({ default: m.AdminProductFormPage })));
const AdminOrdersPage = lazy(() => import("@/admin/pages/admin-orders").then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import("@/admin/pages/admin-order-detail").then(m => ({ default: m.AdminOrderDetailPage })));
const AdminBillingPage = lazy(() => import("@/admin/pages/admin-billing").then(m => ({ default: m.AdminBillingPage })));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

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
        <Route path="/admin/billing" component={AdminWrapper} />
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
    "/admin/billing": AdminBillingPage,
  };
  const Component = routeMap[path] ?? AdminDashboardPage;

  return (
    <AdminRouteGuard>
      <AdminSuspense>
        <Component />
      </AdminSuspense>
    </AdminRouteGuard>
  );
}

function AdminProductFormWrapper() {
  return (
    <AdminRouteGuard>
      <AdminSuspense>
        <AdminProductFormPage />
      </AdminSuspense>
    </AdminRouteGuard>
  );
}

function AdminOrderDetailWrapper() {
  return (
    <AdminRouteGuard>
      <AdminSuspense>
        <AdminOrderDetailPage />
      </AdminSuspense>
    </AdminRouteGuard>
  );
}

function AdminGalleryFormWrapper() {
  return (
    <AdminRouteGuard>
      <AdminSuspense>
        <AdminGalleryFormPage />
      </AdminSuspense>
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
