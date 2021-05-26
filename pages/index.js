import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Lyrics from "../components/Lyrics";
import Search from "../components/search";
import Song from "../components/Song";
import { getLyricsFromGenius } from "./api/getLyrics";
import { searchSongsOnGenius } from "./api/searchSongs";
import { cleanLyrics, cleanLyricsIntoArray } from "../lib/utils";
import LyricsPlaceholder from "../components/LyricsPlaceholder";
import PlaybackControl from "../components/PlaybackControl";

import { getSession, signIn, signOut, useSession } from "next-auth/client";
import { initPlayer, takeOver, loadSDK } from "../lib/initPlayer";
import LyricsBlockPreview from "../components/LyricsBlockPreview";

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

  const [playing, setPlaying] = useState("");

  const [song, setSong] = useState(defaultSongMetadata);
  const [err, setErr] = useState(lyricsTransformErr);

  useEffect(() => {
    startPlayer();
  }, [activeBlock, userTypeByBlock]);

  const handleSongChange = async (song) => {
    setErr(null);
    setSong(song);
    setLyricsLoading(true);

    const songName = song.title.split("by")[0];
    const artistName = song.title.split("by")[1].substr(1);

    const lyricsData = await fetch(
      `./api/getLyrics?songName=${songName}&artistName=${artistName}`
    ).then((res) => res.text());

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
    setUserTypeByBlock((existing) => [...existing, userTypeForEachBlock]);
    setActiveBlock((i) => Math.min(i + 1, lyrics.filteredLyrics.length - 1));
  };

  return (
    <div className="bg-gradient-to-b from-purple-600 via-purple-400 to-purple-300 text-white min-h-screen">
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-20 max-w-screen-2xl m-auto flex flex-col">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-5xl select-none mr-5">🎧</a>
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
            <Song data={song} currentlyPlaying={true} />

            <label
              htmlFor="hideProfanity"
              className="opacity-70 hover:opacity-100 transition-all cursor-pointer"
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

            {!lyricsLoading ? (
              <>
                <Lyrics
                  lyricsData={lyrics}
                  activeBlock={activeBlock}
                  profanityHidden={profanityHidden}
                  blockComplete={handleBlockComplete}
                />

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
            ) : (
              <LyricsPlaceholder />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps(context) {
  const defaultSongName = "durag activity",
    defaultSongArtist = "baby keem";

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
