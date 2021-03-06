import Head from "next/head";
import { useEffect, useState } from "react";
import Lyrics from "../components/Lyrics";
import Search from "../components/Search";
import RoundComplete from "../components/RoundComplete";
import Song from "../components/Song";
import { getLyricsFromGenius } from "./api/getLyrics";
import { searchSongsOnGenius } from "./api/searchSongs";
import { cleanLyricsIntoArray } from "../lib/utils.js";
import LyricsPlaceholder from "../components/LyricsPlaceholder";
import SongPlaceholder from "../components/SongPlaceholder";
import { motion } from "framer-motion";
import { getSession, signIn, signOut, useSession } from "next-auth/client";
import { initPlayer, takeOver, loadSDK } from "../lib/initPlayer";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Home({
  defaultSongLyrics,
  defaultSongMetadata,
  lyricsTransformErr,
}) {
  const router = useRouter();
  const [session] = useSession();

  const [profanityHidden, setProfanityHidden] = useState(true);
  const [lyrics, setLyrics] = useState(defaultSongLyrics);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [blockTitles, setBlockTitles] = useState([]);

  const [activeBlock, setActiveBlock] = useState(0);
  const [userTypeByBlock, setUserTypeByBlock] = useState([]);
  const [roundComplete, setRoundComplete] = useState(false);

  const [playing, setPlaying] = useState("");

  const [song, setSong] = useState(defaultSongMetadata);
  const [err, setErr] = useState(lyricsTransformErr);

  const [blockTimes, setBlockTimes] = useState([]);

  const [coverColors, setCoverColors] = useState([]);
  const [restoredFromSearch, setRestoredFromSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (router.query.i && router.query.q && !restoredFromSearch) {
      setSong(null);
      setRestoredFromSearch(true);
    }

    startPlayer();

    const getProminentColors = async () => {
      if (!song || !song.albumArt) return;

      const { colors, err } = await fetch(
        `./api/getProminentCoverColors?coverUrl=${song.albumArt}`
      ).then((res) => res.json());

      if (err) return;

      setCoverColors(colors);
    };

    getProminentColors();

    if (lyrics) {
      setBlockTitles(lyrics.filteredLyrics.map((l) => l.block));
    }

    restoreProfanity();

    setIsMobile(window.innerWidth < 1000);

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [activeBlock, userTypeByBlock, song, playing, router.query]);

  const handleWindowResize = (e) => {
    setIsMobile(window.innerWidth < 1000);
  };

  const restoreProfanity = async () => {
    const profanity = await localStorage.getItem("sandmanProfanity");

    if (profanity === null) return;

    setProfanityHidden(JSON.parse(profanity));
  };

  const handleSongChange = async (newSong) => {
    setErr(null);
    setSong(newSong);
    setLyricsLoading(true);
    setBlockTimes(null);
    setRoundComplete(false);
    setActiveBlock(0);

    const lyricsData = await fetch(
      `./api/getLyrics?songUrl=${newSong.url}`
    ).then((res) => res.text());

    if (!lyricsData) return;

    try {
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
      setBlockTitles(lyrics.map((l) => l.block));
      setLyricsLoading(false);
    } catch (err) {
      setLyricsLoading(false);
      setErr(`Failed to transform lyrics`);
      return;
    }
  };

  const startPlayer = (setupOnCall = false) => {
    getSession().then(async (session) => {
      if (!session) return;

      initPlayer(session.user.access_token, updatePlaying, setupOnCall);

      if (!setupOnCall) {
        loadSDK();
      }
    });
  };

  const updatePlaying = (state, setupOnCall) => {
    setPlaying((existing) => {
      return { ...existing, ...state };
    });

    if (setupOnCall) {
      takeOver(session.user.access_token, state.deviceId);
    }
  };

  const handleBlockComplete = (userTypeForEachBlock) => {
    setBlockTimes((blockTimes) => [...blockTimes, new Date()]);
    setUserTypeByBlock((existing) => [...existing, userTypeForEachBlock]);
    setActiveBlock((i) => {
      const newBlock = Math.min(i + 1, lyrics.filteredLyrics.length - 1);

      if (i + 1 === lyrics.filteredLyrics.length) handleRoundComplete();

      return newBlock;
    });
  };

  const handleRoundComplete = (userTypeForEachBlock) => {
    setUserTypeByBlock((existing) => [...existing, userTypeForEachBlock]);
    setActiveBlock(0);
    setRoundComplete(true);
  };

  const handleRoundRestart = () => {
    setRoundComplete(false);
    setActiveBlock(0);
    setBlockTimes([new Date()]);
    setUserTypeByBlock([]);

    if (playing && playing.track_window && window.player != undefined) {
      window.player.seek(-1);
    }
  };

  return (
    <div className={`p-12 ${roundComplete ? "" : "overflow-hidden"}`}>
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isMobile && (
        <div className="text-white">
          <p>
            Unfortunately, mobile devices are not supported by sandman. Please
            give it a go when you are on your desktop.
          </p>

          <p className="mt-4">Have a good day!</p>
          <div className="mt-2 flex items-center">
            <p className="text-3xl pr-2">-</p>
            <Image
              src="/sandman.svg"
              alt="me"
              width="30"
              height="30"
              draggable="false"
            />
          </div>
        </div>
      )}

      {!isMobile && (
        <motion.div
          style={{
            "--tw-gradient-from": coverColors ? coverColors[1] : "#1DB954",
          }}
          className={`lyricsBox bg-gradient-to-b from-green-700 to-black text-white rounded-extraLarge shadow-lg`}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100vh", opacity: 0 }}
          transition={{
            delay: 0.5,
            y: { type: "spring", stiffness: 40 },
            default: { duration: 2 },
          }}
        >
          <div className="p-20 max-w-screen-2xl m-auto flex flex-col">
            <div className="flex items-center">
              <Image
                src="/sandman.svg"
                alt="me"
                width="50"
                height="50"
                draggable="false"
              />
              <Search
                handleSongChange={handleSongChange}
                failedToRestoreFromSearch={() => setSong(defaultSongMetadata)}
              />
              {!session && (
                <button
                  className="ml-auto hover:opacity-80 focus:outline-none"
                  onClick={() => signIn("spotify")}
                >
                  Sign in with Spotify
                </button>
              )}
              {session && (
                <div className="ml-auto flex-row-reverse flex">
                  <button
                    className="ml-5 hover:opacity-50 focus:outline-none"
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
            ) : song === null ? (
              <SongPlaceholder
                vibrant={coverColors ? coverColors[0] : ""}
                darkVibrant={coverColors ? coverColors[1] : ""}
              />
            ) : (
              <>
                <Song
                  data={song}
                  currentlyPlaying={true}
                  isTyping={
                    blockTimes && blockTimes.length !== 0 && !roundComplete
                  }
                  playingState={playing}
                  nextBlock={
                    activeBlock + 1 < blockTitles.length
                      ? blockTitles[activeBlock + 1]
                      : null
                  }
                  requestBlockComplete={handleBlockComplete}
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
                        setProfanityHidden((h) => {
                          localStorage.setItem(
                            "sandmanProfanity",
                            JSON.stringify(!h)
                          );

                          return !h;
                        });
                      }}
                      checked={profanityHidden}
                    />
                    <span>Filter profanity</span>
                  </label>

                  {!lyricsLoading && !roundComplete && (
                    <Lyrics
                      lyricsData={lyrics}
                      activeBlock={activeBlock}
                      profanityHidden={profanityHidden}
                      blockComplete={handleBlockComplete}
                      finishRound={handleRoundComplete}
                      startInitialTimer={() => {
                        setBlockTimes([new Date()]);
                      }}
                    />
                  )}

                  {lyricsLoading && !roundComplete && (
                    <LyricsPlaceholder
                      vibrant={coverColors ? coverColors[0] : ""}
                      darkVibrant={coverColors ? coverColors[1] : ""}
                    />
                  )}

                  {!lyricsLoading && roundComplete && (
                    <RoundComplete
                      userTyping={userTypeByBlock}
                      lyricsData={lyrics}
                      blockTitles={blockTitles}
                      profanityHidden={profanityHidden}
                      blockStartTimes={blockTimes}
                      restartRound={handleRoundRestart}
                      handleSongChange={handleSongChange}
                      songData={song}
                    />
                  )}
                </Song>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  const defaultSongName = "Ok Ok by Kanye West",
    defaultSongArtist = "Kanye West";


  const { data: songMetadata } = await searchSongsOnGenius(
    defaultSongName,
    defaultSongArtist
  );

  const { data: defaultSongLyrics, err } = await getLyricsFromGenius(
    null, null, songMetadata?.[0]?.url
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
