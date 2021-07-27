import { useEffect, useState } from "react";
import useDebounce from "../lib/useDebounce";
import SearchResults from "./SearchResults";
import { useRouter } from "next/router";

export default function Search({
  handleSongChange,
  failedToRestoreFromSearch,
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [songRestoredFromSearch, setSongRestoredFromSearch] = useState(false);

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

      const restoreSongFromSearch = async () => {
        const { q, i } = router.query;

        if (q && i) {
          const results = await searchSongs(q);

          setSongRestoredFromSearch(true);

          if (i >= results.length) {
            failedToRestoreFromSearch();
            return;
          }

          handleSongChange(results[i]);
        }
      };

      if (!songRestoredFromSearch) restoreSongFromSearch();
    },
    [debouncedSearchTerm, router.query] // Only call effect if debounced search term changes
  );

  const searchSongs = async (query) => {
    const response = await fetch(`/api/searchSongs?songName=${query}`).then(
      (res) => res.json()
    );

    return Object.values(response).slice(0, 5);
  };

  const selectSong = (song, index) => {
    router.replace(`?q=${search}&i=${index}`, null, {
      shallow: true,
      scroll: false,
    });

    handleSongChange(song);
    setResults([]);
    setSearch(null);
  };

  return (
    <div>
      <input
        placeholder="Search songs..."
        type="text"
        tabIndex="1"
        onChange={(e) => setSearch(e.target.value)}
        className="text-black rounded-lg shadow-xl w-80 ml-5"
        onKeyDown={(e) => {
          if (e.key === "Escape") setResults([]);
        }}
      />

      <SearchResults
        results={results}
        query={search}
        hideResults={() => setResults([])}
        selectSong={selectSong}
      />
    </div>
  );
}
