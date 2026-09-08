// src/pages/caja/hooks/useCaja.js
import { useState, useEffect, useCallback } from 'react';
import { abrirCaja, getCajaActual, cerrarCaja, getHistorialCaja } from '../../../services/api/caja.api';

const ITEMS_PER_PAGE = 5;

export const useCaja = () => {
  const [actual, setActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [cajaActual, historialData] = await Promise.all([getCajaActual(), getHistorialCaja()]);
    setActual(cajaActual);
    setHistorial(historialData);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = async (montoInicial, notas) => {
    setError('');
    setProcesando(true);
    try {
      await abrirCaja(montoInicial, notas);
      await cargar();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo abrir la caja');
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const cerrar = async (montoContado, notas) => {
    if (!actual?.sesion?.id) return false;
    setError('');
    setProcesando(true);
    try {
      await cerrarCaja(actual.sesion.id, montoContado, notas);
      await cargar();
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo cerrar la caja');
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const historialPaginado = historial.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(historial.length / ITEMS_PER_PAGE));

  return {
    actual,
    loading,
    procesando,
    error,
    abrir,
    cerrar,
    historial,
    historialPaginado,
    currentPage,
    setCurrentPage,
    totalPages,
    recargar: cargar,
  };
};
