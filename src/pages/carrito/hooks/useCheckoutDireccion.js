// src/pages/carrito/hooks/useCheckoutDireccion.js
import { useState, useEffect } from 'react';
import { getDirecciones, createDireccion } from '../../../services/api/usuarios.api';

// Selección/creación de la dirección de entrega del checkout: direcciones
// guardadas del usuario, la dirección "nueva" del formulario inline, y su
// sincronización con `formData` del checkout. Vive aparte de
// useCheckoutForm porque es un flujo autocontenido (cargar direcciones,
// elegir una, o crear una nueva), aunque escribe sobre el `formData`
// compartido del checkout.
export const useCheckoutDireccion = ({ user, setFormData, toast }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });

  useEffect(() => {
    const loadDirecciones = async () => {
      if (user && user.documento) {
        try {
          const dirs = await getDirecciones();
          setDirecciones(dirs || []);
          if (!selectedDireccionId) {
            setSelectedDireccionId('registered');
            setFormData(prev => ({
              ...prev,
              direccion: user.direccion || '',
              barrio: user.barrio || '',
              telefono: user.telefono || user.celular || ''
            }));
          }
        } catch (err) {
          console.error('Error cargando direcciones:', err);
        }
      }
    };
    loadDirecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se ejecuta solo al identificar/cambiar de usuario
  }, [user]);

  const handleDireccionSelect = (e) => {
    const id = e.target.value;
    if (id === 'new') {
      setShowNewAddress(true);
      setSelectedDireccionId(id);
      setFormData(prev => ({ ...prev, direccion: '', barrio: '', telefono: '' }));
    } else if (id === 'registered') {
      setShowNewAddress(false);
      setSelectedDireccionId(id);
      setFormData(prev => ({
        ...prev,
        direccion: user.direccion || '',
        barrio: user.barrio || '',
        telefono: user.telefono || user.celular || ''
      }));
    } else {
      setShowNewAddress(false);
      setSelectedDireccionId(id);
      const dir = direcciones.find(d => String(d.id) === String(id));
      if (dir) {
        setFormData(prev => ({
          ...prev,
          direccion: dir.direccion,
          barrio: dir.barrio,
          telefono: dir.telefono || prev.telefono,
          direccion2: dir.tipo || ''
        }));
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.direccion?.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    if (!user) {
      toast.error('Debe iniciar sesión para guardar una dirección');
      return;
    }

    if (direcciones.length >= 3) {
      toast.error('Máximo 3 direcciones guardadas. Por favor elimina una para agregar una nueva.');
      return;
    }

    const dirData = {
      nombre: `${newAddress.direccion} ${newAddress.barrio || ''}`.trim(),
      direccion: newAddress.direccion,
      barrio: newAddress.barrio || '',
      telefono: newAddress.telefono || user.telefono || user.celular || '',
      tipo: newAddress.tipo || 'casa',
      es_predeterminada: direcciones.length === 0
    };

    try {
      const respuesta = await createDireccion(dirData);
      let nuevaDir = respuesta;
      let guardadaExitosamente = false;

      if (Array.isArray(respuesta) && respuesta.length > 0) {
        const dirText = (newAddress.direccion || '').toLowerCase().trim();
        const found = respuesta.find(d => (d.direccion || '').toLowerCase().trim() === dirText);
        if (found) {
          nuevaDir = found;
          guardadaExitosamente = true;
        } else {
          nuevaDir = respuesta[respuesta.length - 1];
          guardadaExitosamente = Boolean(nuevaDir?.id || nuevaDir?._id);
        }
      } else if (respuesta && (respuesta.id || respuesta._id)) {
        guardadaExitosamente = true;
      }

      if (guardadaExitosamente && nuevaDir) {
        setDirecciones(prev => [...prev, nuevaDir]);
        setSelectedDireccionId(nuevaDir.id || nuevaDir._id);
        setFormData(prev => ({
          ...prev,
          direccion: nuevaDir.direccion || newAddress.direccion,
          barrio: nuevaDir.barrio || newAddress.barrio,
          telefono: nuevaDir.telefono || newAddress.telefono || user.telefono || user.celular || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          direccion: newAddress.direccion,
          barrio: newAddress.barrio,
          telefono: newAddress.telefono || user.telefono || user.celular || ''
        }));
      }
    } catch (e) {
      console.error('Error agregando dirección:', e);
      setFormData(prev => ({
        ...prev,
        direccion: newAddress.direccion,
        barrio: newAddress.barrio,
        telefono: newAddress.telefono || user.telefono || user.celular || ''
      }));
    }
    setShowNewAddress(false);
    setNewAddress({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });
  };

  return {
    direcciones,
    selectedDireccionId,
    showNewAddress,
    setShowNewAddress,
    newAddress,
    setNewAddress,
    handleDireccionSelect,
    handleAddAddress,
  };
};
