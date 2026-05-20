import { useLocation } from "react-router";

export default function Pokemon() {
  const location = useLocation();
  const pokemon = location.pathname.split("/")[2];

  return (
    <div>
      <h1>pokemon</h1>
    </div>
  );
}
