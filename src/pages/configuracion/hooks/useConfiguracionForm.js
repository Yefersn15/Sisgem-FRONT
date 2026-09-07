// src/pages/configuracion/hooks/useConfiguracionForm.js
import { useState, useEffect } from 'react';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { updateConfiguracion } from '../services/configuracionService';
import { useToast } from '../../../context/ToastContext';

// Estado local del FORMULARIO de edición (precargado desde el contexto global
// una vez termina de cargar). No duplica el estado global: solo lo copia a un
// borrador editable y, al guardar, pide al contexto que se recargue con los
// datos ya persistidos en la base de datos.
export const useConfiguracionForm = () => {
  const config = useConfiguracion();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!config.loading && !form) {
      setForm({
        nombreTienda: config.nombreTienda || '',
        logoUrl: config.logoUrl || '',
        descripcion: config.descripcion || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        horario: config.horario?.length ? config.horario : [],
        mapaEmbedUrl: config.mapaEmbedUrl || '',
        tema: config.tema || { colorAcento: '#3b82f6' },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe precargar una vez, cuando termina de cargar
  }, [config.loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateConfiguracion(form);
      await config.refetch();
      toast.success('Configuración actualizada para toda la tienda');
    } catch (err) {
      toast.error(err.message || 'Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  return { form, setForm, guardando, handleSubmit };
};
