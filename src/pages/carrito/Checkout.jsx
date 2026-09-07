import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useCheckoutForm } from './hooks/useCheckoutForm';
import DireccionEntregaFields from './components/DireccionEntregaFields';
import MetodoPagoFields from './components/MetodoPagoFields';
import ResumenPedido from './components/ResumenPedido';

const Checkout = () => {
  const {
    user,
    cartItemsWithDetails,
    direcciones,
    selectedDireccionId,
    showNewAddress,
    setShowNewAddress,
    newAddress,
    setNewAddress,
    formData,
    errors,
    subtotal,
    total,
    submitting,
    handleChange,
    handleDireccionSelect,
    handleAddAddress,
    handleSubmit,
  } = useCheckoutForm();

  if (cartItemsWithDetails.length === 0) {
    return <div className="container mt-4">Redirigiendo...</div>;
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
            <h4>Debes iniciar sesión</h4>
            <p className="text-muted">Para continuar con el checkout, necesitas tener una cuenta e iniciar sesión.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login?redirect=/checkout" className="btn btn-primary">
                <i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
              </Link>
              <Link to="/register?redirect=/checkout" className="btn btn-outline-primary">
                <i className="fas fa-user-plus me-2"></i>Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Confirmar Pedido</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <i className="fas fa-user me-2"></i>
                Comprando como: <strong>{user.nombre} {user.apellido}</strong> ({user.email})
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="delivery"
                    name="delivery"
                    checked={formData.delivery}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="delivery">
                    Solicitar Domicilio
                  </label>
                </div>

                {formData.delivery && (
                  <DireccionEntregaFields
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    direcciones={direcciones}
                    selectedDireccionId={selectedDireccionId}
                    handleDireccionSelect={handleDireccionSelect}
                    showNewAddress={showNewAddress}
                    setShowNewAddress={setShowNewAddress}
                    newAddress={newAddress}
                    setNewAddress={setNewAddress}
                    handleAddAddress={handleAddAddress}
                  />
                )}

                <hr />

                <MetodoPagoFields formData={formData} errors={errors} handleChange={handleChange} />

                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Procesando...</>
                  ) : (
                    <><i className="fas fa-check-circle me-2"></i>Confirmar Pedido{!formData.delivery && ` - ${formatPrice(total)}`}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <ResumenPedido items={cartItemsWithDetails} subtotal={subtotal} total={total} delivery={formData.delivery} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
