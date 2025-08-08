import { useState } from "react";
import { useApi } from "./ApiContext";

/**
 * useMutation(method, resource, tagsToInvalidate?)
 * Returns: { mutate, data, loading, error }
 *
 * Pass plain objects for `body` — ApiContext will JSON.stringify it and set headers.
 */
export default function useMutation(method, resource, tagsToInvalidate = []) {
  const { request, invalidateTags } = useApi();

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body) => {
    setLoading(true);
    setError(null);

    try {
      const result = await request(resource, { method, body });
      setData(result);
      invalidateTags(tagsToInvalidate);
      return { ok: true, data: result };
    } catch (e) {
      console.error(e);
      setError(e.message || "Request failed");
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
}
