// src/pages/dashboard/hooks/useDashboardStats.js
import { useState, useEffect, useMemo } from 'react';
import { getDashboardStats, getTopProductos, getTopByBrand, getTopByCategory } from '../services/dashboardService';
import { getVentas } from '../../../services/api/pedidos.api';
import { getProductos } from '../../../services/api/productos.api';
import { getMarcas } from '../../../services/api/marcas.api';
import { getCategorias } from '../../../services/api/categorias.api';

const DIAS_POR_FILTRO = { dia: 1, semana: 7, mes: 30, trimestre: 90, semestre: 180, año: 365 };

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    ventasSemana: 0,
    productos: 0,
    usuarios: 0,
    domiciliosPendientes: 0
  });
  const [ventas, setVentas] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topProductos, setTopProductos] = useState([]);
  const [topMarcas, setTopMarcas] = useState([]);
  const [topCategorias, setTopCategorias] = useState([]);
  const [filtroVentas, setFiltroVentas] = useState('semana');

  // Cada lista (ventas, productos, marcas, categorías) se trae UNA sola vez
  // aquí y se reutiliza para todo (stats, rankings, gráfico) — antes cada
  // ranking pedía su propia copia completa de las mismas listas, así que
  // abrir el dashboard disparaba la misma consulta varias veces en paralelo.
  useEffect(() => {
    const cargarDatos = async () => {
      const [resumen, ventasData, productos, marcas, categorias] = await Promise.all([
        getDashboardStats().catch(() => null),
        getVentas(),
        getProductos(),
        getMarcas(),
        getCategorias(),
      ]);

      setStats({
        ventasHoy: resumen?.ventasHoy || 0,
        ventasMes: resumen?.ventasMes || 0,
        ventasSemana: resumen?.ventasSemana || 0,
        productos: resumen?.productosActivos ?? productos.length,
        usuarios: resumen?.usuariosActivos ?? 0,
        domiciliosPendientes: resumen?.domiciliosPendientes ?? 0,
      });

      setVentas(ventasData || []);
      setVentasRecientes(
        [...(ventasData || [])]
          .sort((a, b) => new Date(b.fecha || b.fechaVenta) - new Date(a.fecha || a.fechaVenta))
          .slice(0, 5)
      );

      setTopProductos(getTopProductos(ventasData || [], 15));
      setTopMarcas(getTopByBrand(ventasData || [], productos || [], marcas || [], 15));
      setTopCategorias(getTopByCategory(ventasData || [], productos || [], categorias || [], 15));

      setLoading(false);
    };

    cargarDatos();
  }, []);

  // Solo recalcula el gráfico (dato ya en memoria) al cambiar el filtro, sin
  // volver a pedir nada al backend.
  const chartDataSemana = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
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
    return dias;
  }, [ventas, filtroVentas]);

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
