import { useNavigate } from 'react-router-dom';
import { usePedidosAdmin } from './hooks/usePedidosAdmin';
import { usePedidoBuilder } from './hooks/usePedidoBuilder';
import CrearPedidoModal from './components/CrearPedidoModal';
import PedidosAdminFiltros from './components/PedidosAdminFiltros';
import PedidoRow from './components/PedidoRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const PedidosAdmin = () => {
  useAyudaPagina({
    titulo: 'Pedidos',
    contenido: <p>Gestiona los pedidos hechos por los clientes (mostrador y domicilio). Los pedidos pagados por abono requieren aprobar o rechazar la solicitud antes de continuar.</p>,
  });
  const navigate = useNavigate();
  const {
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    busqueda,
    setBusqueda,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentItems,
    cargarPedidos,
    handleAprobarSolicitudAbono,
    handleRechazarAbono,
  } = usePedidosAdmin();

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
    addItem,
    removeItem,
    totalForm,
    guardarPedido,
  } = usePedidoBuilder(productos, cargarPedidos);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p className="text-muted mb-0">Administra los pedidos de los clientes</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus me-1"></i>Nuevo Pedido
        </button>
      </div>

      <PedidosAdminFiltros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        filterMetodo={filterMetodo}
        setFilterMetodo={setFilterMetodo}
        clearFilters={clearFilters}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay pedidos registrados
                    </td>
                  </tr>
                ) : (
                  currentItems.map(pedido => (
                    <PedidoRow
                      key={pedido.id}
                      pedido={pedido}
                      onAprobarAbono={handleAprobarSolicitudAbono}
                      onRechazarAbono={handleRechazarAbono}
                      onVerDetalle={(id) => navigate(`/pedidos/${id}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {modal === 'crear' && (
        <CrearPedidoModal
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
          onGuardar={guardarPedido}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default PedidosAdmin;
