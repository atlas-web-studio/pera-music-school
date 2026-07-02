import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import Teachers from "./pages/Teachers.jsx";
import Contact from "./pages/Contact.jsx";
import Programs from "./pages/Programs.jsx";
import About from "./pages/About.jsx";
import Faq from "./pages/Faq.jsx";
import Registration from "./pages/Registration.jsx";
import TrialSession from "./pages/TrialSession.jsx";
import WorkWithUs from "./pages/WorkWithUs.jsx";
import PortalLogin from "./pages/PortalLogin.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";

import AdminAuthProvider from "./admin/AdminAuth.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import TeachersAdmin from "./admin/TeachersAdmin.jsx";
import ProgramsAdmin from "./admin/ProgramsAdmin.jsx";
import MessagesAdmin from "./admin/MessagesAdmin.jsx";
import SettingsAdmin from "./admin/SettingsAdmin.jsx";

function AppShell() {
  const { pathname, hash } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute ? <Navbar key={`${pathname}${hash}`} /> : null}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} /> 
        <Route path="/teachers" element={<Teachers />} /> 
        <Route path="/programs" element={<Programs />} /> 
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/trial-session" element={<TrialSession />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        <Route path="/portal" element={<PortalLogin />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <AdminRoute />
            </AdminAuthProvider>
          }
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="teachers" element={<TeachersAdmin />} />
            <Route path="programs" element={<ProgramsAdmin />} />
            <Route path="messages" element={<MessagesAdmin inboxType="work" />} />
            <Route
              path="trial-sessions"
              element={<MessagesAdmin inboxType="trial" />}
            />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
        </Route>
      </Routes>

      {!isAdminRoute ? <Footer /> : null}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
