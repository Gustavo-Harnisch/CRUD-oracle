import { useEffect, useState } from "react";
import { fetchRegiones, createRegion, fetchCiudades, createCiudad, fetchComunas, createComuna, fetchCalles, createCalle } from "../services/adminService";

const AdminUbicacionesPage = () => {
  const [regiones, setRegiones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [calles, setCalles] = useState([]);
  const [regionForm, setRegionForm] = useState({ cod_region: "", region: "" });
  const [ciudadForm, setCiudadForm] = useState({ cod_ciudad: "", ciudad: "", cod_region: "" });
  const [comunaForm, setComunaForm] = useState({ cod_comuna: "", comuna: "", cod_ciudad: "" });
  const [calleForm, setCalleForm] = useState({ cod_calle: "", calle: "", nro: "", cod_comuna: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const calls = [fetchRegiones(), fetchCiudades(), fetchComunas(), fetchCalles()];
    const results = await Promise.allSettled(calls);
    const take = (idx) => (results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : []);

    setRegiones(take(0));
    setCiudades(take(1));
    setComunas(take(2));
    setCalles(take(3));
    const failed = results.find((r) => r.status === "rejected");
    setError(failed ? "No se pudieron cargar ubicaciones" : null);
    if (failed) console.error("Admin ubicaciones error", failed.reason);
  };

  useEffect(() => {
    load();
  }, []);

  const withReset = (msg) => {
    setMessage(msg);
    setError(null);
  };

  const handleRegionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRegion({ cod_region: Number(regionForm.cod_region), region: regionForm.region });
      withReset("Región creada");
      setRegionForm({ cod_region: "", region: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la región");
    }
  };

  const handleCiudadSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCiudad({
        cod_ciudad: Number(ciudadForm.cod_ciudad),
        ciudad: ciudadForm.ciudad,
        cod_region: ciudadForm.cod_region ? Number(ciudadForm.cod_region) : null,
      });
      withReset("Ciudad creada");
      setCiudadForm({ cod_ciudad: "", ciudad: "", cod_region: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la ciudad");
    }
  };

  const handleComunaSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComuna({
        cod_comuna: Number(comunaForm.cod_comuna),
        comuna: comunaForm.comuna,
        cod_ciudad: comunaForm.cod_ciudad ? Number(comunaForm.cod_ciudad) : null,
      });
      withReset("Comuna creada");
      setComunaForm({ cod_comuna: "", comuna: "", cod_ciudad: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la comuna");
    }
  };

  const handleCalleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCalle({
        cod_calle: Number(calleForm.cod_calle),
        calle: calleForm.calle,
        nro: calleForm.nro,
        cod_comuna: calleForm.cod_comuna ? Number(calleForm.cod_comuna) : null,
      });
      withReset("Calle creada");
      setCalleForm({ cod_calle: "", calle: "", nro: "", cod_comuna: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la calle");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Ubicaciones</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Regiones y ciudades</h5>
              <form className="row g-2 align-items-end" onSubmit={handleRegionSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod región"
                    value={regionForm.cod_region}
                    onChange={(e) => setRegionForm((p) => ({ ...p, cod_region: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Nombre región"
                    value={regionForm.region}
                    onChange={(e) => setRegionForm((p) => ({ ...p, region: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear
                  </button>
                </div>
              </form>
              <div className="table-responsive mt-3" style={{ maxHeight: "150px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regiones.map((r) => (
                      <tr key={r.COD_REGION}>
                        <td>{r.COD_REGION}</td>
                        <td>{r.REGION}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-3" />

              <form className="row g-2 align-items-end" onSubmit={handleCiudadSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod ciudad"
                    value={ciudadForm.cod_ciudad}
                    onChange={(e) => setCiudadForm((p) => ({ ...p, cod_ciudad: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre ciudad"
                    value={ciudadForm.ciudad}
                    onChange={(e) => setCiudadForm((p) => ({ ...p, ciudad: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={ciudadForm.cod_region}
                    onChange={(e) => setCiudadForm((p) => ({ ...p, cod_region: e.target.value }))}
                    required
                  >
                    <option value="">Cod región</option>
                    {regiones.map((r) => (
                      <option key={r.COD_REGION} value={r.COD_REGION}>
                        {r.COD_REGION} - {r.REGION}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear
                  </button>
                </div>
              </form>
              <div className="table-responsive mt-3" style={{ maxHeight: "150px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ciudad</th>
                      <th>Región</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciudades.map((c) => (
                      <tr key={c.COD_CIUDAD}>
                        <td>{c.COD_CIUDAD}</td>
                        <td>{c.CIUDAD}</td>
                        <td>{c.COD_REGION}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Comunas y calles</h5>
              <form className="row g-2 align-items-end" onSubmit={handleComunaSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod comuna"
                    value={comunaForm.cod_comuna}
                    onChange={(e) => setComunaForm((p) => ({ ...p, cod_comuna: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre comuna"
                    value={comunaForm.comuna}
                    onChange={(e) => setComunaForm((p) => ({ ...p, comuna: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={comunaForm.cod_ciudad}
                    onChange={(e) => setComunaForm((p) => ({ ...p, cod_ciudad: e.target.value }))}
                    required
                  >
                    <option value="">Cod ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.COD_CIUDAD} value={c.COD_CIUDAD}>
                        {c.COD_CIUDAD} - {c.CIUDAD}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear
                  </button>
                </div>
              </form>

              <div className="table-responsive mt-3" style={{ maxHeight: "130px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Comuna</th>
                      <th>Ciudad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comunas.map((c) => (
                      <tr key={c.COD_COMUNA}>
                        <td>{c.COD_COMUNA}</td>
                        <td>{c.COMUNA}</td>
                        <td>{c.COD_CIUDAD}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-3" />

              <form className="row g-2 align-items-end" onSubmit={handleCalleSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod calle"
                    value={calleForm.cod_calle}
                    onChange={(e) => setCalleForm((p) => ({ ...p, cod_calle: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre calle"
                    value={calleForm.calle}
                    onChange={(e) => setCalleForm((p) => ({ ...p, calle: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    placeholder="Nro"
                    value={calleForm.nro}
                    onChange={(e) => setCalleForm((p) => ({ ...p, nro: e.target.value }))}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={calleForm.cod_comuna}
                    onChange={(e) => setCalleForm((p) => ({ ...p, cod_comuna: e.target.value }))}
                    required
                  >
                    <option value="">Cod comuna</option>
                    {comunas.map((c) => (
                      <option key={c.COD_COMUNA} value={c.COD_COMUNA}>
                        {c.COD_COMUNA} - {c.COMUNA}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-1">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear
                  </button>
                </div>
              </form>

              <div className="table-responsive mt-3" style={{ maxHeight: "130px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Calle</th>
                      <th>Nro</th>
                      <th>Comuna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calles.map((c) => (
                      <tr key={c.COD_CALLE}>
                        <td>{c.COD_CALLE}</td>
                        <td>{c.CALLE}</td>
                        <td>{c.NRO}</td>
                        <td>{c.COD_COMUNA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUbicacionesPage;
