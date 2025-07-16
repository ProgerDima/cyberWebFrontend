import React from "react";

export const Modal = ({ open, onClose, children }: any) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", zIndex: 1000
    }}>
      <div style={{
        background: "#23263a", padding: 24, borderRadius: 8,
        maxWidth: 400, margin: "100px auto"
      }}>
        {children}
        <button onClick={onClose} style={{ marginTop: 16 }}>Закрити</button>
      </div>
    </div>
  );
};

export const ModalBody = ({ children }: any) => <div>{children}</div>;
export const ModalFooter = ({ children }: any) => <div style={{ marginTop: 16 }}>{children}</div>;