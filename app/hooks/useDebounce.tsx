import { useEffect } from "react";

export default function useDebounce(ms: number, callback: Function) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      callback();
    }, ms);
    return () => {
      clearTimeout(timeout);
    };
  });
}
