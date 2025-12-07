// src/pages/employee/EmployeeHome.jsx
import HeroSection from "../../components/HeroSection";

const employeeHero = "/employee-hero.jpg";

const EmployeeHome = () => {
  return (
    <HeroSection
      backgroundImage={employeeHero}
      title="Dashboard de empleado"
      subtitle="Organiza check-in, habitaciones y peticiones en un solo lugar."
      primaryLabel="Ir al dashboard"
      primaryHref="/employee"
      secondaryLabel="Clientes y check-in"
      secondaryHref="/employee/clients"
      overlayOpacity={0.55}
    />
  );
};

export default EmployeeHome;
