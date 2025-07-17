import React from "react";

export const Modal = ({ open, onClose, children }: any) => {
  if (!open) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalBody = ({ children }: any) => <div>{children}</div>;
export const ModalFooter = ({ children }: any) => <div style={{ marginTop: 16 }}>{children}</div>;