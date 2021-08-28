import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function RelatedSongs({ artistName, handleSongChange }) {
  const [relatedSongs, setRelatedSongs] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const searchRelatedSongs = async (query) => {
      const response = await fetch(`/api/searchSongs?songName=${query}`).then(
        (response) => response.json()
      );

      setRelatedSongs(response.slice(0, 5));
    };
    searchRelatedSongs(artistName);
  }, []);

  const SongCard = ({ song, index }) => {
    return (
      <div
        className="flex flex-col items-center cursor-pointer mr-2 mb-2 w-40"
        onClick={() => {
          router.replace(`?q=${artistName}&i=${index}`, null, {
            shallow: true,
            scroll: false,
          });
          handleSongChange(song);
        }}
      >
        <img
          src={song.albumArt}
          alt={`Cover of ${song.title}`}
          width={160}
          height={160}
          draggable={false}
          className="rounded-lg shadow-xl select-none hover:scale-125"
        />
        <h2 className="text-base my-2 text-center font-dela">
          {song.title.split(" by")[0]}
        </h2>
      </div>
    );
  };

  if (relatedSongs.length === 0) return <></>;

  return (
    <div>
      <h2 className="text-xl font-dela mb-2 mt-0">Related Songs</h2>

      <div className="flex flex-wrap">
        {relatedSongs.map((song, index) => (
          <SongCard index={index} key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
