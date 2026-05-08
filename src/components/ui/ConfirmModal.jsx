import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';

/**
 * ConfirmModal refactorizado usando el sistema de composición Modal.
 * Pattern: architecture-compound-components
 */
export function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        
        <Modal.Header>
          <div className="modal-icon-container" style={{ color: 'var(--danger)' }}>
            <Trash2 size={36} />
          </div>
          <h3 className="modal-title">
            {title || '¿Confirmar Acción?'}
          </h3>
        </Modal.Header>

        <Modal.Body>
          <p className="modal-message">
            {message || 'Esta acción no se puede deshacer. ¿Deseas continuar?'}
          </p>
        </Modal.Body>

        <Modal.Footer>
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
            Sí, Borrar Todo
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}