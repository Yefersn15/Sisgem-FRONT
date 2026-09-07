import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDomicilios } from './hooks/useAdminDomicilios';
import RepartidorModal from './components/RepartidorModal';
import DomicilioCard from './components/DomicilioCard';
import FiltrosBar from '../../components/FiltrosBar';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const DomiciliosAdmin = () => {
  useAyudaPagina({
    titulo: 'Domicilios',
    contenido: <p>Asigna repartidor y sigue el estado de cada envío: pendiente, aprobado, asignado, en camino o entregado. Desde aquí también puedes imprimir la guía o avisar por WhatsApp.</p>,
  });
  const {
    domiciliosConVenta,
    repartidoresList,
    selectedRepartidorId,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    showRepartidorModal,
    setShowRepartidorModal,
    repartidorForm,
    openRepartidorModal,
    handleRepartidorInput,
    handleSelectRepartidor,
    handleSaveRepartidor,
    handleCambiarEstado,
    handleConvertirAVenta,
    handleEditarTarifa,
    handleNotas,
    handleImprimir,
    handleWhatsapp,
    handleExportar,
    handleImport,
  } = useAdminDomicilios();
  const fileInputRef = useRef(null);

  const onImportChange = (e) => {
    const file = e.target.files[0];
    handleImport(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Administración de Domicilios</h2>
          <p className="text-muted mb-0">Gestiona los envíos y repartidores</p>
        </div>
        <div className="d-flex gap-2">
          <input type="file" ref={fileInputRef} accept=".xlsx, .xls" style={{ display: 'none' }} onChange={onImportChange} />
          <button className="btn btn-outline-primary" onClick={handleExportar}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <button className="btn btn-outline-primary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
          <Link to="/admin/ventas" className="btn btn-secondary">
            <i className="fas fa-arrow-left me-1"></i> Volver a Ventas
          </Link>
        </div>
      </div>

      <FiltrosBar onClear={clearFilters}>
        <div className="col-12 col-md-4">
          <input className="form-control" placeholder="Buscar por ID, dirección, teléfono, estado o repartidor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-6 col-md">
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="asignado">Asignado</option>
            <option value="en_camino">En Camino</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </FiltrosBar>

      <div className="row">
        {domiciliosConVenta.map(dom => (
          <div className="col-md-6 col-lg-4 mb-3" key={String(dom.id || dom.pedidoId)}>
            <DomicilioCard
              dom={dom}
              onCambiarEstado={handleCambiarEstado}
              onEditarTarifa={handleEditarTarifa}
              onAsignarRepartidor={openRepartidorModal}
              onImprimir={handleImprimir}
              onWhatsapp={handleWhatsapp}
              onNotas={handleNotas}
              onConvertirAVenta={handleConvertirAVenta}
            />
          </div>
        ))}
      </div>

      {showRepartidorModal && (
        <RepartidorModal
          repartidoresList={repartidoresList}
          selectedRepartidorId={selectedRepartidorId}
          repartidorForm={repartidorForm}
          onSelectRepartidor={handleSelectRepartidor}
          onInputChange={handleRepartidorInput}
          onSave={handleSaveRepartidor}
          onClose={() => setShowRepartidorModal(false)}
        />
      )}
    </div>
  );
};

export default DomiciliosAdmin;
