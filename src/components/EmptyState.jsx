import { Inbox } from "lucide-react";

const EmptyState = ({ icon: Icon = Inbox, title = "Nothing here yet", message = "", action = null }) => (
  <div className="text-center py-16 px-4">
    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-muted-foreground" />
    </div>
    <p className="font-display font-bold text-foreground">{title}</p>
    {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
