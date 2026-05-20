import { useEffect, useRef, useState } from "react";
import Alite from "~/alite/alite";
import AliteErrors from "~/alite/AliteErrors";
import useFetch from "~/hooks/useFetch";
import useDebounce from "~/hooks/useDebounce";

import PokemonCard from "~/components/PokemonCard";

export function Welcome() {
  const [search, setSearch] = useState("");
  const [debounceQuery, setDebounceQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [pokemonsData, setPokemonsData] = useState([]);

  const sentinelRef = useRef(null);

  // fetch on observer intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0];
        if (sentinel.isIntersecting) {
          setOffset((prev) => prev + 20);
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  //searching pokemon
  useEffect(() => {
    const timeout = setTimeout(() => {
      let searchQuery = search.replaceAll(" ", "+");
      setDebounceQuery(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  const handleSearchInput = (e) => {
    setSearch((prev) => e.target.value);
  };

  const { data, isLoading, error } = useFetch({
    url: `/api/pokemon/${debounceQuery}?offset=${offset}&limit=20`,
    refetch: [debounceQuery, offset],
  });

  useEffect(() => {
    if (data && !isLoading) {
      setPokemonsData((prev) => [...prev, ...data.results]);
    }
  }, [data, isLoading]);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4"></div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <input
            className="bg-amber-50 text-black"
            type="text"
            onChange={handleSearchInput}
            value={search}
          />

          {pokemonsData.map((pokemon, idx) => {
            return <PokemonCard key={idx} {...pokemon} />;
          })}
          {isLoading && <h1>loading</h1>}
          <div ref={sentinelRef}></div>
        </div>
      </div>
    </main>
  );
}
