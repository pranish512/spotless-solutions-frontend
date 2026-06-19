import { APP_SCREENS } from "@/lib/screens";

/**
 * Reusable Screen-wise Access Control matrix.
 * Enforced across UI/APIs via the permissions payload sent on save.
 *
 * Props:
 *  - value: { [screenKey]: { read, write, delete } }
 *  - onChange: (next) => void
 *  - title?: string
 */
const AccessControlMatrix = ({ value = {}, onChange, title = "Screen-wise Access Control" }) => {
  const toggle = (screenKey, perm) => {
    const current = value[screenKey] || { read: false, write: false, delete: false };
    onChange({
      ...value,
      [screenKey]: { ...current, [perm]: !current[perm] },
    });
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h4 className="font-display font-bold text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Define which screens this role can access and what they can do.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-foreground">Screen / Module</th>
              <th className="px-4 py-2.5 font-medium text-foreground text-center">Read-only</th>
              <th className="px-4 py-2.5 font-medium text-foreground text-center">Write</th>
              <th className="px-4 py-2.5 font-medium text-foreground text-center">Allow Delete</th>
            </tr>
          </thead>
          <tbody>
            {APP_SCREENS.map((s) => {
              const perm = value[s.key] || { read: false, write: false, delete: false };
              return (
                <tr key={s.key} className="border-t border-border">
                  <td className="px-4 py-2.5 text-foreground">{s.label}</td>
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={perm.read}
                      onChange={() => toggle(s.key, "read")}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={perm.write}
                      onChange={() => toggle(s.key, "write")}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={perm.delete}
                      onChange={() => toggle(s.key, "delete")}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessControlMatrix;
