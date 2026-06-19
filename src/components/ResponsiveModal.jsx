import { X } from "lucide-react";

/**
 * ResponsiveModal — single source of truth for popups.
 * - Stays within viewport (max-h-[calc(100vh-2rem)])
 * - Sticky header & footer, internal scroll on body
 * - Prevents horizontal overflow
 * - Works across desktop / laptop / tablet / mobile
 *
 * Props:
 *  - open, onClose, title, children, footer, maxWidth (tw class e.g. "max-w-3xl")
 */
const ResponsiveModal = ({ open, onClose, title, children, footer, maxWidth = "max-w-3xl" }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-card rounded-xl shadow-modal w-full ${maxWidth} my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border shrink-0">
          <h3 className="font-display font-bold text-lg sm:text-xl text-foreground truncate pr-3">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 sm:px-6 py-5">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-border shrink-0 bg-card">{footer}</div>}
      </div>
    </div>
  );
};

export default ResponsiveModal;
