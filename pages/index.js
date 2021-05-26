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

import { getSession, signIn, signOut, useSession } from "next-auth/client";
import { initPlayer, takeOver, loadSDK } from "../lib/initPlayer";

export default function Home({
	defaultSongLyrics,
	defaultSongMetadata,
	lyricsTransformErr,
}) {
	const [session, loading] = useSession();

	const [profanityHidden, setProfanityHidden] = useState(true);
	const [lyrics, setLyrics] = useState(defaultSongLyrics);
	const [lyricsLoading, setLyricsLoading] = useState(false);
	const [activeBlock, setActiveBlock] = useState(1);
	const [playing, setPlaying] = useState("");

	const [song, setSong] = useState(defaultSongMetadata);

	useEffect(() => {
		startPlayer();
	}, []);

	const handleSongChange = async (song) => {
		setSong(song);
		setLyricsLoading(true);

		const songName = song.title.split("by")[0];
		const artistName = song.title.split("by")[1].substr(1);

		const lyrics = await fetch(
			`./api/getLyrics?songName=${songName}&artistName=${artistName}`
		).then((res) => res.text());

		if (!lyrics) return;

		setLyrics(cleanLyrics(lyrics));
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

				{lyricsTransformErr ? (
					<p className="my-20">
						This song is not supported yet. Please try a different one.
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
							<Lyrics
								lyricsData={lyrics}
								activeBlock={activeBlock}
								profanityHidden={profanityHidden}
							/>
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
	const defaultSongName = "SICKO MODE",
		defaultSongArtist = "Travis Scott";

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
