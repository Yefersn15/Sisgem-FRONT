// src/pages/dashboard/components/TopRankingTable.jsx
import React from 'react';
import { formatPrice } from '../../../services/dataService';

const TopRankingTable = ({ title, columnLabel, items }) => (
  <div className="card h-100">
    <div className="card-header">{title}</div>
    <div className="card-body p-0">
      {items.length > 0 ? (
        <table className="table table-sm mb-0">
          <thead>
            <tr><th>{columnLabel}</th><th>Cant</th><th>Total</th></tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted text-center p-3">Sin datos</p>
      )}
    </div>
  </div>
);

export default TopRankingTable;
