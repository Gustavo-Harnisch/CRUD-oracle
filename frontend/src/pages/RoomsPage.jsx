// src/pages/RoomsPage.jsx
const RoomsPage = () => {
  const rooms = [
    { id: 1, name: "Habitación Simple", capacity: 1, status: "Disponible" },
    { id: 2, name: "Habitación Doble", capacity: 2, status: "Ocupada" },
    { id: 3, name: "Habitación Familiar", capacity: 4, status: "Disponible" },
  ];

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Habitaciones</h1>
      <p className="text-muted">
        Esta sección mostrará el listado real de habitaciones desde la base de datos.
      </p>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Capacidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.name}</td>
                <td>{room.capacity}</td>
                <td>{room.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsPage;
