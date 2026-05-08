import React, { createContext, use, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './Modal.css';

const ModalContext = createContext(null);

/**
 * Modal Compound Component
 * Pattern: architecture-compound-components
 */
export function Modal({ isOpen, onClose, children, className = '' }) {
  // Manejo de escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <ModalContext.Provider value={{ onClose }}>
      <AnimatePresence>
        {isOpen && (
          <div className={`modal-root ${className}`} role="dialog" aria-modal="true">
            {children}
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

Modal.Overlay = function ModalOverlay({ className = '' }) {
  const { onClose } = use(ModalContext);
  return (
    <motion.div 
      className={`modal-overlay ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    />
  );
};

Modal.Content = function ModalContent({ children, className = '', maxWidth = '440px' }) {
  return (
    <motion.div 
      className={`modal-content glass ${className}`}
      style={{ maxWidth }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

Modal.Header = function ModalHeader({ children, className = '' }) {
  return (
    <div className={`modal-header ${className}`}>
      {children}
    </div>
  );
};

Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`modal-body ${className}`}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`modal-footer ${className}`}>
      {children}
    </div>
  );
};

Modal.CloseButton = function ModalCloseButton({ className = '' }) {
  const { onClose } = use(ModalContext);
  return (
    <button className={`modal-close-btn ${className}`} onClick={onClose} aria-label="Cerrar">
      <X size={20} />
    </button>
  );
};
