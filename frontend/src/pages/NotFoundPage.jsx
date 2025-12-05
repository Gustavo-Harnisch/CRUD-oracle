// src/pages/NotFoundPage.jsx
const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4">404</h1>
      <p className="lead mb-4">La página que buscas no existe.</p>
      <a href="/" className="btn btn-primary">
        Volver al inicio
      </a>
    </div>
  );
};

export default NotFoundPage;
