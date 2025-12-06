// src/pages/admin/AdminHome.jsx
import HeroSection from "../../components/HeroSection";

const adminHero = "/admin-hero.jpg";

const AdminHome = () => {
  return (
    <HeroSection
      backgroundImage={adminHero}
      title="Panel administrativo"
      subtitle="Controla inventario, personal y tarifas desde un mismo lugar."
      primaryLabel="Ir al dashboard"
      primaryHref="/admin"
      secondaryLabel="Revisar usuarios"
      secondaryHref="/admin/users"
      overlayOpacity={0.55}
    />
  );
};

export default AdminHome;
