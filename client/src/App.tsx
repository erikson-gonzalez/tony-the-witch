import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart";
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
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
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
      <ScrollToTop />
      <AdminThemeEffect />
      <Switch>
        <Route path="/admin/products/new" component={AdminProductFormWrapper} />
        <Route path="/admin/products/:id" component={AdminProductFormWrapper} />
        <Route path="/admin/gallery/new" component={AdminGalleryFormWrapper} />
        <Route path="/admin/gallery/:id" component={AdminGalleryFormWrapper} />
        <Route path="/admin/config" component={AdminWrapper} />
        <Route path="/admin/nav-cards" component={AdminWrapper} />
        <Route path="/admin/gallery" component={AdminWrapper} />
        <Route path="/admin/products" component={AdminWrapper} />
        <Route path="/admin" component={AdminWrapper} />
        <Route path="/" component={Home} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/:slug" component={ProductDetail} />
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

function AdminGalleryFormWrapper() {
  return (
    <AdminRouteGuard>
      <AdminGalleryFormPage />
    </AdminRouteGuard>
  );
}

function App() {
  return (
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
  );
}

export default App;
