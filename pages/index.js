import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Lyrics from "../components/Lyrics";
import Search from "../components/search";
import RoundComplete from "../components/RoundComplete";
import Song from "../components/Song";
import { getLyricsFromGenius } from "./api/getLyrics";
import { searchSongsOnGenius } from "./api/searchSongs";
import { cleanLyricsIntoArray } from "../lib/utils.js";
import LyricsPlaceholder from "../components/LyricsPlaceholder";
import PlaybackControl from "../components/PlaybackControl";

import { getSession, signIn, signOut, useSession } from "next-auth/client";
import { initPlayer, takeOver, loadSDK } from "../lib/initPlayer";
import LyricsBlockPreview from "../components/LyricsBlockPreview";
import Image from "next/image";

export default function Home({
  defaultSongLyrics,
  defaultSongMetadata,
  lyricsTransformErr,
}) {
  const [session, loading] = useSession();

  const [profanityHidden, setProfanityHidden] = useState(true);
  const [lyrics, setLyrics] = useState(defaultSongLyrics);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);
  const [userTypeByBlock, setUserTypeByBlock] = useState([]);
  const [roundComplete, setRoundComplete] = useState(false);

  const [playing, setPlaying] = useState("");

  const [song, setSong] = useState(defaultSongMetadata);
  const [err, setErr] = useState(lyricsTransformErr);

  const [blockTimes, setBlockTimes] = useState();

  const [coverColors, setCoverColors] = useState([]);

  useEffect(() => {
    // startPlayer();

    const getProminentColors = async () => {
      if (!song || !song.albumArt) return;

      const { colors, err } = await fetch(
        `./api/getProminentCoverColors?coverUrl=${song.albumArt}`
      ).then((res) => res.json());

      if (err) return;

      setCoverColors(colors);
    };

    getProminentColors();
  }, [activeBlock, userTypeByBlock, song]);

  const handleSongChange = async (song) => {
    setErr(null);
    setSong(song);
    setLyricsLoading(true);
    setBlockTimes(null);
    setRoundComplete(false);

    const lyricsData = await fetch(`./api/getLyrics?songUrl=${song.url}`).then(
      (res) => res.text()
    );

    if (!lyricsData) return;

    const {
      lyrics,
      filteredLyrics,
      err: lyricsTransformErr,
    } = cleanLyricsIntoArray(lyricsData);

    if (lyricsTransformErr) {
      setLyricsLoading(false);
      setErr(lyricsTransformErr);
      return;
    }

    setLyrics({ lyrics, filteredLyrics });
    setLyricsLoading(false);
  };

  const startPlayer = (setupOnCall = false) => {
    getSession().then(async (session) => {
      if (!session) return;
      initPlayer(
        session.user.access_token,
        updatePlaying,
        stoppedPlaying,
        setupOnCall
      );
      if (!setupOnCall) {
        loadSDK();
      }
    });
  };

  const updatePlaying = (state, setupOnCall) => {
    setPlaying(state);
    if (setupOnCall) {
      takeOver(session.user.access_token, state.deviceId);
    }
  };

  const stoppedPlaying = () => {
    setPlaying({ deviceSwitched: true });
  };

  const handleBlockComplete = (userTypeForEachBlock) => {
    setBlockTimes((blockTimes) => [...blockTimes, new Date()]);
    setUserTypeByBlock((existing) => [...existing, userTypeForEachBlock]);
    setActiveBlock((i) => Math.min(i + 1, lyrics.filteredLyrics.length - 1));
  };

  const handleRoundComplete = (userTypeForEachBlock) => {
    if (activeBlock === 0) return;
    setUserTypeByBlock((existing) => [...existing, userTypeForEachBlock]);
    setActiveBlock(0);
    setRoundComplete(true);
  };

  return (
    <div className="p-12 bg-black">
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{
          "--tw-gradient-from": coverColors ? coverColors[1] : "#1DB954",
        }}
        className="lyricsBox bg-gradient-to-b from-green-700 to-black text-white rounded-extraLarge shadow-lg overflow-hidden"
      >
        <div className="p-20 max-w-screen-2xl m-auto flex flex-col">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/sandman.svg"
                alt="me"
                width="50"
                height="50"
                draggable="false"
              />
            </Link>
            <Search selectSong={handleSongChange} />

            {!session && (
              <button
                className="ml-auto font-bold hover:opacity-80 focus:outline-none"
                onClick={() => signIn("spotify")}
              >
                Sign in with Spotify
              </button>
            )}
            {session && (
              <div className="ml-auto flex-row-reverse flex">
                <button
                  className="font-bold ml-5 hover:opacity-50 focus:outline-none"
                  onClick={() => signOut()}
                >
                  Sign out
                </button>
                <img
                  className="w-10 h-10 rounded-full select-none pointer-events-none inline-block"
                  src={session?.user?.picture}
                  draggable={false}
                ></img>
              </div>
            )}
          </div>

          {err ? (
            <p className="my-20">
              This song is not supported yet. Please try a different one.
              <code className="block text-sm my-2 opacity-70">
                Error message: {err}
              </code>
            </p>
          ) : (
            <>
              <Song
                data={song}
                currentlyPlaying={true}
                isTyping={
                  blockTimes && blockTimes.length !== 0 && !roundComplete
                }
              >
                <label
                  htmlFor="hideProfanity"
                  className="opacity-70 hover:opacity-100 transition-all cursor-pointer mt-2"
                >
                  <input
                    tabIndex="0"
                    type="checkbox"
                    id="hideProfanity"
                    className="rounded-sm mr-2"
                    onChange={() => {
                      setProfanityHidden((h) => !h);
                    }}
                    checked={profanityHidden}
                  />
                  <span>Filter profanity</span>
                </label>

                {!lyricsLoading && !roundComplete && (
                  <>
                    {blockTimes ? (
                      <Lyrics
                        lyricsData={lyrics}
                        activeBlock={activeBlock}
                        profanityHidden={profanityHidden}
                        blockComplete={handleBlockComplete}
                        finishRound={handleRoundComplete}
                      />
                    ) : (
                      <>
                        <button
                          tabIndex={0}
                          className="mr-auto my-10 mb-5 bg-gray-200 hover:bg-gray-300 transition ease-in-out px-10 py-2 text-purple-600 rounded-lg shadow-lg font-dela"
                          onClick={() => {
                            setBlockTimes([new Date()]);
                          }}
                        >
                          Start Typing
                        </button>
                        <LyricsBlockPreview
                          lyricsData={lyrics}
                          activeBlock={0}
                          profanityHidden={profanityHidden}
                        />
                      </>
                    )}

                    {lyrics.filteredLyrics
                      .slice(activeBlock + 1)
                      .map((block, index) => {
                        return (
                          <LyricsBlockPreview
                            key={index}
                            lyricsData={lyrics}
                            activeBlock={activeBlock + index + 1}
                            profanityHidden={profanityHidden}
                          />
                        );
                      })}
                  </>
                )}

                {lyricsLoading && !roundComplete && <LyricsPlaceholder />}

                {!lyricsLoading && roundComplete && (
                  <RoundComplete
                    userTyping={userTypeByBlock}
                    lyricsData={lyrics}
                    profanityHidden={profanityHidden}
                    blockStartTimes={blockTimes}
                  />
                )}
              </Song>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps(context) {
  const defaultSongName = "town crier",
    defaultSongArtist = "mavi";

  const { data: defaultSongLyrics, err } = await getLyricsFromGenius(
    defaultSongName,
    defaultSongArtist
  );
  const { data: songMetadata } = await searchSongsOnGenius(
    defaultSongName,
    defaultSongArtist
  );

  if (err) {
    return {
      props: {
        err,
      },
    };
  }

  const {
    lyrics,
    filteredLyrics,
    err: lyricsTransformErr,
  } = cleanLyricsIntoArray(defaultSongLyrics);

  if (lyricsTransformErr) return { props: { lyricsTransformErr } };

  return {
    props: {
      defaultSongLyrics: { lyrics, filteredLyrics },
      defaultSongMetadata: Object.values(songMetadata)[0],
    },
  };
}
