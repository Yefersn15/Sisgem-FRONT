// src/pages/configuracion/hooks/useConfiguracionForm.js
import { useState, useEffect, useRef } from 'react';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { updateConfiguracion } from '../services/configuracionService';
import { useToast } from '../../../context/ToastContext';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

export const TOTAL_PASOS = 3;

// Estado local del FORMULARIO de edición (precargado desde el contexto global
// una vez termina de cargar). No duplica el estado global: solo lo copia a un
// borrador editable y, al guardar, pide al contexto que se recargue con los
// datos ya persistidos en la base de datos.
export const useConfiguracionForm = () => {
  const config = useConfiguracion();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [paso, setPaso] = useState(1);
  // Igual que en useRegisterForm/useUsuarioForm: recién tras un intento de
  // avanzar con el paso inválido se muestra el error debajo del campo.
  const [pasosConIntento, setPasosConIntento] = useState({});
  const logoRef = useRef(null);

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
        tema: config.tema || { modo: 'NINGUNO', paletaId: null, colores: null },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe precargar una vez, cuando termina de cargar
  }, [config.loading]);

  // Único campo realmente obligatorio de toda la configuración: los demás
  // (contacto, horario) son opcionales, por eso solo el paso 1 valida algo.
  const pasoEsValido = (numeroPaso) => {
    if (numeroPaso === 1) {
      return Boolean(form.nombreTienda.trim().length >= 2);
    }
    return true;
  };

  const siguientePaso = () => {
    if (!pasoEsValido(paso)) {
      setPasosConIntento((prev) => ({ ...prev, [paso]: true }));
      return;
    }
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  };

  const pasoAnterior = () => {
    setPaso((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const logo = await resolverImagenPendiente(logoRef, form.logoUrl);
      if (!logo.ok) {
        toast.error('No se pudo subir el logo, intenta de nuevo');
        return;
      }
      await updateConfiguracion({ ...form, logoUrl: logo.url });
      await config.refetch();
      toast.success('Configuración actualizada para toda la tienda');
    } catch (err) {
      toast.error(err.message || 'Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  return {
    form,
    setForm,
    guardando,
    handleSubmit,
    logoRef,
    paso,
    mostrarErrores: Boolean(pasosConIntento[paso]),
    siguientePaso,
    pasoAnterior,
  };
};
