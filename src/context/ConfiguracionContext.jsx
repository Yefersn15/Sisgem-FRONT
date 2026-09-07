import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConfiguracion } from '../services/api/configuracion.api';
import { aplicarTemaCss } from '../utils/tema';

const DEFECTO = {
  nombreTienda: 'SISGEM',
  logoUrl: '',
  descripcion: '',
  direccion: '',
  telefono: '',
  email: '',
  horario: [],
  tema: { colorAcento: '#3b82f6' },
  mapaEmbedUrl: '',
};

const ConfiguracionContext = createContext({ ...DEFECTO, loading: true, refetch: () => {} });

// A diferencia de una preferencia personal (tema claro/oscuro, guardado por
// navegador en localStorage — ver hooks/useModoOscuro.js), esta configuración
// vive en la base de datos y es la MISMA para todos los visitantes del
// sitio: se carga una vez al montar la app desde GET /api/configuracion.
export const ConfiguracionProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFECTO);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const data = await getConfiguracion();
      setConfig({ ...DEFECTO, ...data });
    } catch (err) {
      console.error('No se pudo cargar la configuración del sitio:', err);
    }
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  useEffect(() => {
    if (config.tema?.colorAcento) aplicarTemaCss(config.tema.colorAcento);
  }, [config.tema?.colorAcento]);

  return (
    <ConfiguracionContext.Provider value={{ ...config, loading, refetch }}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-ubicado a propósito con su Provider
export const useConfiguracion = () => useContext(ConfiguracionContext);
