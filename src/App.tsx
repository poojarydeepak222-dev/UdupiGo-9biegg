import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthInit } from "@/hooks/useAuthInit";
import Index from "./pages/Index";
import Search from "./pages/Search";
import BusinessDetail from "./pages/BusinessDetail";
import News from "./pages/News";
import ListBusiness from "./pages/ListBusiness";
import B2B from "./pages/B2B";
import BusinessDashboard from "./pages/BusinessDashboard";
import Profile from "./pages/Profile";
import Pay from "./pages/Pay";
import Leads from "./pages/Leads";
import Notifications from "./pages/Notifications";
import Offers from "./pages/Offers";
import Advertise from "./pages/Advertise";
import Transactions from "./pages/Transactions";
import CustomerService from "./pages/CustomerService";
import Help from "./pages/Help";
import Quotes from "./pages/Quotes";
import Careers from "./pages/Careers";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Investors from "./pages/Investors";
import WhatsNew from "./pages/WhatsNew";
import More from "./pages/More";
import Terms from "./pages/Terms";
import UsedProducts from "./pages/UsedProducts";
import SellProduct from "./pages/SellProduct";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import RickshawBook from "./pages/RickshawBook";
import Property from "./pages/Property";
import Electricians from "./pages/Electricians";
import Plumbers from "./pages/Plumbers";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import PublicStore from "./pages/PublicStore";
import Invoice from "./pages/Invoice";

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/list-business" element={<ListBusiness />} />
            <Route path="/b2b" element={<B2B />} />
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/help" element={<Help />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/whats-new" element={<WhatsNew />} />
            <Route path="/more" element={<More />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/used-products" element={<UsedProducts />} />
            <Route path="/sell-product" element={<SellProduct />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/book-rickshaw" element={<RickshawBook />} />
            <Route path="/property" element={<Property />} />
            <Route path="/electricians" element={<Electricians />} />
            <Route path="/plumbers" element={<Plumbers />} />
            <Route path="/website-builder" element={<WebsiteBuilder />} />
            <Route path="/shop/:slug" element={<PublicStore />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
