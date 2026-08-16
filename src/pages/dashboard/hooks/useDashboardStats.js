// src/pages/dashboard/hooks/useDashboardStats.js
import { useState, useEffect } from 'react';
import { getTopProductos, getTopByBrand, getTopByCategory } from '../services/dashboardService';
import { getVentas, getProductos, getProveedores, getUsuarios, getOrdenesCompra, getDomicilios } from '../../../services/dataService';

const DIAS_POR_FILTRO = { dia: 1, semana: 7, mes: 30, trimestre: 90, semestre: 180, año: 365 };

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    ventasSemana: 0,
    productos: 0,
    proveedores: 0,
    usuarios: 0,
    ordenes: 0,
    domiciliosPendientes: 0
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topProductos, setTopProductos] = useState([]);
  const [topMarcas, setTopMarcas] = useState([]);
  const [topCategorias, setTopCategorias] = useState([]);
  const [chartDataSemana, setChartDataSemana] = useState([]);
  const [filtroVentas, setFiltroVentas] = useState('semana');

  useEffect(() => {
    const cargarDatos = async () => {
      const ventas = (await getVentas()) || [];
      const productos = (await getProductos()) || [];
      const proveedores = (await getProveedores()) || [];
      const usuarios = (await getUsuarios()) || [];
      const ordenes = (await getOrdenesCompra()) || [];
      const domicilios = (await getDomicilios()) || [];

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const ventasHoy = ventas.filter(v => new Date(v.fecha || v.fechaVenta) >= hoy);

      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ventasMes = ventas.filter(v => new Date(v.fecha || v.fechaVenta) >= inicioMes);

      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hoy.getDate() - 7);
      const ventasSemana = ventas.filter(v => {
        const fecha = new Date(v.fecha || v.fechaVenta);
        return fecha >= hace7Dias && fecha <= hoy;
      });

      const domPendientes = domicilios.filter(d => {
        const e = String(d.estado || '').toLowerCase();
        return e === 'pendiente' || e === 'aprobado' || e === 'enviado';
      });

      const recientes = [...ventas]
        .sort((a, b) => new Date(b.fecha || b.fechaVenta) - new Date(a.fecha || a.fechaVenta))
        .slice(0, 5);

      setStats({
        ventasHoy: ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0),
        ventasMes: ventasMes.reduce((sum, v) => sum + (v.total || 0), 0),
        ventasSemana: ventasSemana.reduce((sum, v) => sum + (v.total || 0), 0),
        productos: productos.length,
        proveedores: proveedores.length,
        usuarios: usuarios.length,
        ordenes: ordenes.length,
        domiciliosPendientes: domPendientes.length
      });

      setVentasRecientes(recientes);
      setTopProductos(await getTopProductos(15));
      setTopMarcas(await getTopByBrand(15));
      setTopCategorias(await getTopByCategory(15));

      const dias = [];
      const diasAUsar = DIAS_POR_FILTRO[filtroVentas] || 7;
      for (let i = diasAUsar - 1; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const ventasDiaData = ventas.filter(v => (v.fecha || v.fechaVenta || '').toString().split('T')[0] === fechaStr);
        dias.push({
          dia: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          ventas: ventasDiaData.reduce((s, v) => s + (v.total || 0), 0)
        });
      }
      setChartDataSemana(dias);
      setLoading(false);
    };

    cargarDatos();
  }, [filtroVentas]);

  return {
    stats,
    ventasRecientes,
    loading,
    topProductos,
    topMarcas,
    topCategorias,
    chartDataSemana,
    filtroVentas,
    setFiltroVentas,
  };
};
