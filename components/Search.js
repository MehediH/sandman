import { useEffect, useState } from "react";
import useDebounce from "../lib/useDebounce";
import SearchResults from "./SearchResults";

export default function Search({ selectSong }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const debouncedSearchTerm = useDebounce(search, 200);

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        searchSongs(debouncedSearchTerm).then((results) => {
          setResults(results);
        });
      } else {
        setResults([]);
      }
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  const searchSongs = async (query) => {
    const response = await fetch(`/api/searchSongs?songName=${query}`).then(
      (res) => res.json()
    );

    return Object.values(response).slice(0, 5);
  };

  return (
    <div className="">
      <input
        placeholder="Search songs..."
        type="text"
        tabIndex="1"
        onChange={(e) => setSearch(e.target.value)}
        className="text-black rounded-lg shadow-xl w-80"
        onKeyDown={(e) => {
          if (e.key === "Escape") setResults([]);
        }}
      />

      {results.length != 0 && (
        <SearchResults
          results={results}
          hideResults={() => setResults([])}
          selectSong={selectSong}
        />
      )}
    </div>
  );
}
