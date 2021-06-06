import { useEffect, useState } from "react";
import { MdFastForward, MdKeyboardReturn, MdSpaceBar } from "react-icons/md";
import { FaSpotify } from "react-icons/fa";
import Hint from "./Hint";
import { motion } from "framer-motion";
import PlaybackControl from "./PlaybackControl";
import { getSession, signIn } from "next-auth/client";

export default function Song({
  data,
  currentlyPlaying = false,
  children,
  isTyping,
  playingState,
  nextBlock,
  requestBlockComplete,
}) {
  const [songData, setSongData] = useState();
  const [songFeatures, setSongFeatures] = useState({});
  const [existsOnSpotify, setExistsOnSpotify] = useState(false);
  const [requestedSpotifyPlayback, setRequestedSpotifyPlayback] =
    useState(true);

  const [playbackPrompt, setPlaybackPrompt] = useState("Login to Spotify");

  useEffect(() => {
    setSongData(data);

    const getSpotifyData = async () => {
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

        setExistsOnSpotify(true);
        setSongFeatures(songFeatures);
        setRequestedSpotifyPlayback(
          playingState?.tracks?.current_track?.uri === songFeatures.uri
        );
      }
    };

    getSpotifyData();

    getSession().then(async (session) => {
      if (session) {
        setPlaybackPrompt("Listen on Spotify");
      }
    });
  }, [data]);

  const startPlayback = async () => {
    getSession().then(async (session) => {
      if (!session) {
        signIn("spotify");
        return;
      }

      setRequestedSpotifyPlayback(true);
    });
  };

  if (!songData) return null;

  return (
    <div className="flex my-10 items-start">
      <div className="w-80 flex flex-shrink-0 flex-col">
        <img
          src={songData.albumArt}
          alt={`Cover of ${songData.title}`}
          width={320}
          height={320}
          draggable={false}
          className="rounded-lg shadow-xl select-none mb-5"
        />

        {songFeatures && requestedSpotifyPlayback && (
          <PlaybackControl
            playingState={playingState}
            uri={songFeatures.uri}
            bpm={songFeatures.tempo}
            deviceSwitched={() => setRequestedSpotifyPlayback(false)}
          />
        )}

        {songFeatures && !requestedSpotifyPlayback && (
          <div className="flex justify-betwen items-center">
            <button
              className="font-dela bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full flex flex-basis items-center place-self-start transition-all ease-in-out focus:outline-none focus:ring-4 ring-green-200 mr-5 my-2"
              onClick={startPlayback}
            >
              <FaSpotify className="mr-2" size={20} />
              {playbackPrompt}
            </button>
            <span className="font-dela text-sm flex justify-end flex-grow opacity-75">
              {songFeatures && songFeatures.tempo
                ? `${Math.round(songFeatures.tempo)} BPM`
                : existsOnSpotify
                ? "Getting BPM..."
                : ""}
            </span>
          </div>
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5"
          >
            {nextBlock && (
              <div
                className="flex opacity-75 border-2 border-gray-200 py-2 px-4 text-sm rounded-md cursor-pointer hover:opacity-100 transition ease-in-out"
                onClick={requestBlockComplete}
              >
                Coming up next: {nextBlock}
              </div>
            )}

            <div className="flex flex-col mt-5">
              <Hint keyName="Ctrl + Enter" label="Fast forward to next block">
                <MdFastForward className="mr-1" />
              </Hint>

              <Hint keyName="Space" label="Move to next word/block">
                <MdSpaceBar className="mr-1" />
              </Hint>

              <Hint keyName="Enter" label="Finish current round">
                <MdKeyboardReturn className="mr-1" />
              </Hint>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col ml-10">
        {currentlyPlaying && (
          <span className="opacity-75 font-code">Currently Typing</span>
        )}
        <h2 className="text-4xl font-dela">{songData.title.split(" by")[0]}</h2>
        <h2 className="text-md mt-2 font-code">
          by {songData.title.split(" by")[1].substr(1)}
        </h2>

        {children}
      </div>
    </div>
  );
}
