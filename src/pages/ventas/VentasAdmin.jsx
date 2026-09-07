import { useVentasAdmin } from './hooks/useVentasAdmin';
import { useVentaBuilder } from './hooks/useVentaBuilder';
import VentaModal from './components/VentaModal';
import VentasAdminFiltros from './components/VentasAdminFiltros';
import VentaRow from './components/VentaRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const VentasAdmin = () => {
  useAyudaPagina({
    titulo: 'Ventas',
    contenido: <p>Registra ventas de mostrador y gestiona su estado. Una venta anulada no se puede reactivar; hay que registrar una nueva.</p>,
  });
  const {
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    query,
    setQuery,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentVentas,
    cargarVentas,
    anularVenta,
    aprobarVenta,
    generarReporte,
  } = useVentasAdmin();

  const {
    modal,
    setModal,
    form,
    setForm,
    item,
    setItem,
    seleccionarUsuario,
    setSeleccionarUsuario,
    handleCreate,
    handleSelectProducto,
    handleEdit,
    addItem,
    removeItem,
    totalForm,
    guardarVenta,
    actualizarVenta,
  } = useVentaBuilder(productos, cargarVentas);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>Gestión de Ventas</h2>
          <p className="text-muted mb-0">Administra las ventas y pedidos</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={generarReporte}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus me-1"></i>Nueva Venta
          </button>
        </div>
      </div>

      <VentasAdminFiltros
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        filterMetodo={filterMetodo}
        setFilterMetodo={setFilterMetodo}
        query={query}
        setQuery={setQuery}
        clearFilters={clearFilters}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Subtotal</th>
                  <th className="text-end">Envío</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentVentas.length > 0 ? (
                  currentVentas.map((venta) => (
                    <VentaRow key={venta.id} venta={venta} onEdit={handleEdit} onAprobar={aprobarVenta} onAnular={anularVenta} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay ventas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <VentaModal
          modal={modal}
          usuarios={usuarios}
          productos={productos}
          form={form}
          setForm={setForm}
          item={item}
          setItem={setItem}
          seleccionarUsuario={seleccionarUsuario}
          setSeleccionarUsuario={setSeleccionarUsuario}
          onSelectProducto={handleSelectProducto}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          totalForm={totalForm}
          onSubmit={modal === 'crear' ? guardarVenta : actualizarVenta}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default VentasAdmin;
