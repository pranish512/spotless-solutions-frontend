/**
 * Lightweight Active/Deactive switch used on listing tables.
 */
const ToggleSwitch = ({ checked, onChange, labelOn = "Active", labelOff = "Deactive" }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 group"
      aria-pressed={checked}
    >
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${checked ? "text-primary" : "text-muted-foreground"}`}>
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
};

export default ToggleSwitch;
