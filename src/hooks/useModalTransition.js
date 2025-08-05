import { useState, useCallback } from 'react';

export const useModalTransition = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    // Esperar a que termine la animación antes de cerrar
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // Tiempo de la animación fadeOut
  }, []);

  return {
    isOpen,
    isClosing,
    openModal,
    closeModal
  };
}; 