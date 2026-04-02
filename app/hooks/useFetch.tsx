import { useState, useEffect } from "react";
import Alite from "~/alite/alite";

const alite = new Alite();
export default function useFetch({ url, refetch = [] }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const getData = async () => {
      //reset state on change
      setIsLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await alite.get({ url: url, signal: controller.signal });
        setData(result);
        setIsLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();

    return () => controller.abort();
  }, [...refetch]);

  return { data, isLoading, error };
}
