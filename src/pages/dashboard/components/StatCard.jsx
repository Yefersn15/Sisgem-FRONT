// src/pages/dashboard/components/StatCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon, colorClass, footerTo, footerLabel }) => (
  <div className="col-6 col-lg-3">
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted mb-1">{label}</p>
            <h4 className="mb-0">{value}</h4>
          </div>
          <div className={`bg-${colorClass} bg-opacity-10 p-3 rounded`}>
            <i className={`fas ${icon} text-${colorClass} fs-4`}></i>
          </div>
        </div>
      </div>
      {footerTo && (
        <div className="card-footer bg-transparent">
          <Link to={footerTo} className="small">{footerLabel} <i className="fas fa-arrow-right ms-1"></i></Link>
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
