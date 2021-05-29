import { getSession } from "next-auth/client";
import { useEffect, useState } from "react";

export default function Song({
  data,
  currentlyPlaying = false,
  setUri,
  children,
}) {
  const [songData, setSongData] = useState();
  const [songFeatures, setSongFeatures] = useState({});

  useEffect(() => {
    setSongData(data);

    const getSpotifyData = async () => {
      const session = await getSession();
      if (!session) {
        setSongFeatures(null);
        return;
      }
      const { data: searchForSong, err } = await fetch(
        `/api/searchSpotify?q=${data.title}`
      ).then((res) => res.json());

      if (err || searchForSong.length === 0) {
        setSongFeatures(null);
        return;
      }

      if (searchForSong && searchForSong[0].id) {
        const { data: songFeatures, err } = await fetch(
          `/api/getSongFeatures?id=${searchForSong[0].id}`
        ).then((res) => res.json());

        if (err) return;

        setSongFeatures(songFeatures);
        // setUri(songFeatures.uri);
      }
    };

    getSpotifyData();
  }, [data]);

  if (!songData) return null;

  return (
    <div className="flex my-10 items-start">
      <img
        src={songData.albumArt}
        alt={`Cover of ${songData.title}`}
        width={320}
        height={320}
        draggable={false}
        className="rounded-lg shadow-xl select-none"
      />

      <div className="flex flex-col ml-10">
        {currentlyPlaying && (
          <span className="opacity-75">Currently Typing</span>
        )}
        <h2 className="text-4xl font-dela">{songData.title.split(" by")[0]}</h2>
        <h2 className="text-md mt-2">
          by {songData.title.split(" by")[1].substr(1)}
        </h2>

        {songFeatures && songFeatures.tempo && (
          <span>{Math.round(songFeatures.tempo)} BPM</span>
        )}

        {children}
      </div>
    </div>
  );
}
