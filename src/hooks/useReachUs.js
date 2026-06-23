import { useEffect, useState } from "react";
import { reachUsService } from "@/services/reachUsService";

// Shared fetch of the public Reach Us details — used by the footer + Reach Us page.
export function useReachUs() {
  const [data, setData] = useState({ email: "", phone: "", availability: "", location: "" });

  useEffect(() => {
    let active = true;
    reachUsService
      .getPublic()
      .then((d) => { if (active) setData(d); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return data;
}
