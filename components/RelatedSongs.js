import { useState, useEffect } from "react";

export default function RelatedSongs(artistName) {
  const [relatedSongs, setRelatedSongs] = useState([]);

  useEffect(() => {
    const searchRelatedSongs = async (query) => {
      const response = await fetch(
        `/api/searchSongsByArtist?artist=${query}`
      ).then((response) => response.json());

      return Object.values(response).slice(0, 5);
    };

    const songsData = searchRelatedSongs(artistName);

    setRelatedSongs(songsData);
  }, []);

  console.log(relatedSongs);

  const SongCard = (song) => {
    return (
      <div>
        <h1>{song.title}</h1>
        <img
          src={song.albumArt}
          alt={`Cover of ${song.title}`}
          width={160}
          height={160}
          draggable={false}
          className="rounded-lg shadow-xl select-none mb-5"
        />
      </div>
    );
  };

  return (
    <div>
      {/* {relatedSongs && relatedSongs.map((song) => <SongCard song={song} />)} */}
      {relatedSongs && <SongCard song={relatedSongs[0]} />}
    </div>
  );
}
