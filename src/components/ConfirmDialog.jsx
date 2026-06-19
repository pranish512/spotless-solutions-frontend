import { AlertTriangle, X } from "lucide-react";

/**
 * Reusable confirmation dialog for destructive actions (delete, cancel order, etc.)
 *
 * Props:
 *  - open (bool)
 *  - title, message, warning (strings)
 *  - confirmLabel, cancelLabel (strings)
 *  - confirmVariant: "danger" | "primary"
 *  - onConfirm, onCancel (functions)
 */
const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  warning = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-destructive text-destructive-foreground"
      : "bg-primary text-primary-foreground";

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-xl shadow-modal w-full max-w-md p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 rounded-md hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-2">{message}</p>
        {warning && (
          <p className="text-sm text-destructive font-medium bg-destructive/10 rounded-md p-3 mb-2">
            {warning}
          </p>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-lg font-display font-bold text-sm hover:opacity-90 transition-opacity ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
