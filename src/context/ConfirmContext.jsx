// src/context/ConfirmContext.jsx
// Reemplaza window.confirm()/prompt() nativos por un modal consistente con
// el resto de la app. confirm()/promptValue() devuelven una Promise, para
// poder seguir escribiendo "if (!(await confirm(...))) return;" igual que
// antes con window.confirm.
import { createContext, useCallback, useContext, useState } from 'react';
import Modal from '../shared/components/common/Modal';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  // state: { mode: 'confirm'|'prompt', title, message, confirmText, cancelText, danger, defaultValue, resolve }
  const [promptValue, setPromptValue] = useState('');

  const close = useCallback((result) => {
    setState((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({
        mode: 'confirm',
        title: options.title || 'Confirmar acción',
        message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        danger: options.danger ?? false,
        resolve,
      });
    });
  }, []);

  const promptDialog = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setPromptValue(options.defaultValue || '');
      setState({
        mode: 'prompt',
        title: options.title || 'Ingresar dato',
        message,
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        resolve,
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, prompt: promptDialog }}>
      {children}
      {state && (
        <Modal
          title={state.title}
          onClose={() => close(state.mode === 'prompt' ? null : false)}
          maxWidth={420}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => close(state.mode === 'prompt' ? null : false)}>
                {state.cancelText}
              </button>
              <button
                type="button"
                className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => close(state.mode === 'prompt' ? promptValue : true)}
                autoFocus={state.mode !== 'prompt'}
              >
                {state.confirmText}
              </button>
            </>
          }
        >
          <p className="mb-0" style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>{state.message}</p>
          {state.mode === 'prompt' && (
            <input
              type="text"
              className="form-control mt-3"
              value={promptValue}
              autoFocus
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') close(promptValue); }}
            />
          )}
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx.confirm;
};

export const usePrompt = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('usePrompt debe usarse dentro de <ConfirmProvider>');
  return ctx.prompt;
};
