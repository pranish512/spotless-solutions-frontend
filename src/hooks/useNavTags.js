import { useEffect, useState } from "react";
import { productService } from "@/services/productService";

// Shared fetch of the customer navbar tags (max 3, admin-controlled).
// Used by both Header and Footer so the dynamic links stay in sync.
export function useNavTags() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    let active = true;
    productService
      .listNavbarTags()
      .then((list) => {
        if (active) setTags(list);
      })
      .catch(() => {
        if (active) setTags([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return tags;
}
