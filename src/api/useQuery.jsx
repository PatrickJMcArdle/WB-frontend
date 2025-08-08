import { useEffect, useState } from "react";
import { useApi } from "./ApiContext";

/**
 * useQuery(resource, options?)
 * - resource: string | null
 * - options:
 *    - enabled?: boolean (default true)
 *    - tag?: string (optional: used with provideTag/invalidateTags)
 *
 * Returns: { data, loading, error, refetch }
 */
export default function useQuery(resource, { enabled = true, tag } = {}) {
  const { request, provideTag } = useApi();

  const [data, setData] = useState();
  const [loading, setLoading] = useState(Boolean(enabled && resource));
  const [error, setError] = useState(null);

  const refetch = async (signal) => {
    if (!resource) return;
    setLoading(true);
    setError(null);
    try {
      const result = await request(resource, { signal });
      setData(result);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setError(e.message || "Request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!resource || !enabled) return;
    const ctrl = new AbortController();

    // register this query under a tag (optional)
    if (tag) provideTag(tag, () => refetch(ctrl.signal));

    refetch(ctrl.signal);
    return () => ctrl.abort();
    // re-run when resource or enabled change
  }, [resource, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch };
}
