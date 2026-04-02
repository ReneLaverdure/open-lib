import useFetch from "~/hooks/useFetch";

export default function PokemonCard({ name, url }) {
  const { data, isLoading, error } = useFetch({ url: url });
  console.log(data);
  return (
    <div>
      <h4>{name}</h4>
      {isLoading ? (
        <p>loading pokemon</p>
      ) : (
        <img src={data.sprites.front_default} />
      )}
    </div>
  );
}
