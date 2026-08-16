// src/pages/ventas/components/DeliveryTimeline.jsx
import React from 'react';

const DeliveryTimeline = ({ statusSteps, currentStepIndex }) => (
  <div className="card mb-4">
    <div className="card-body">
      <h5 className="mb-4">
        <i className="fas fa-shipping-fast me-2"></i>
        Estado del domicilio
      </h5>
      <div className="position-relative" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div className="position-absolute start-0 end-0" style={{ height: 4, top: 46, background: '#e5e7eb' }}>
          <div className="h-100 bg-success transition-all" style={{ width: `${Math.max(0, currentStepIndex / (statusSteps.length - 1) * 100)}%` }} />
        </div>
        <div className="position-relative d-flex justify-content-between">
          {statusSteps.map((step, idx) => (
            <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '80px' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center border-4 transition ${step.isActive ? 'bg-success border-white text-white' : 'bg-white border-secondary text-secondary'}`} style={{ width: 48, height: 48, ...(step.isCurrent && { boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.3)' }) }}>
                <i className={`fas ${step.icon}`} style={{ fontSize: '1.25rem' }} />
              </div>
              <p className={`mt-2 text-center ${step.isActive ? 'fw-medium text-dark' : 'text-muted'}`} style={{ fontSize: '0.75rem', maxWidth: '80px' }}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DeliveryTimeline;
