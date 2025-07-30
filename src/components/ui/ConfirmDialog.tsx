"use client";

import { Dialog } from "@headlessui/react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean; // ✅ añadido
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false, // ✅ valor por defecto
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/60 z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-sm space-y-4 shadow-xl">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-gray-300">
              {description}
            </Dialog.Description>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={isLoading} // ✅ deshabilita mientras carga
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
