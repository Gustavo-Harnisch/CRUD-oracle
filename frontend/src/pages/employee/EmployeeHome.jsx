// src/pages/employee/EmployeeHome.jsx
import HeroSection from "../../components/HeroSection";

const employeeHero = "/employee-hero.jpg";

const EmployeeHome = () => {
  return (
    <HeroSection
      backgroundImage={employeeHero}
      title="Panel de empleado"
      subtitle="Organiza la operación diaria: agenda, clientes y peticiones."
      primaryLabel="Ver panel diario"
      primaryHref="/employee"
      secondaryLabel="Clientes y check-in"
      secondaryHref="/employee/clients"
      overlayOpacity={0.55}
    />
  );
};

export default EmployeeHome;
