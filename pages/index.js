import Head from 'next/head'
import { useEffect, useState } from 'react'
import Search from '../components/search';
import Song from '../components/Song';
import { cleanLyrics } from '../lib/utils';
import { getLyricsFromGenius } from './api/getLyrics';
import { searchSongsOnGenius } from './api/searchSongs';

export default function Home({ defaultSongLyrics, defaultSongMetadata }) {
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    const getSong = async () => {
      const d = await fetch("/api/getLyrics?songName=Phoenix&artistName=A$AP%20Rocky").then(res => res.text());

      setLyrics(cleanLyrics(d))
    }

    // getSong();
  })

  return (
    <div className="bg-gradient-to-b from-purple-600 via-purple-400 to-purple-300 text-white">
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-20 max-w-screen-2xl m-auto flex flex-col h-screen">
        <h1 className="text-5xl select-none">🎧</h1>

        <Search/>

        <Song data={defaultSongMetadata} currentlyPlaying={true}/>

        <p className='text-2xl font-mono text-left items-center mt-20'>{defaultSongLyrics}</p>
      </div>

    </div>
  )
}

export async function getStaticProps(context) {
  const defaultSongName = "Phoenix", defaultSongArtist = "ASAP Rocky";

  const { data: defaultSongLyrics, err } = await getLyricsFromGenius(defaultSongName, defaultSongArtist);
  const { data: songMetadata } = await searchSongsOnGenius(defaultSongName, defaultSongArtist);

  if (err) {
    return {
      props: {
        err
      },
    }
  }

  return {
    props: { defaultSongLyrics: cleanLyrics(defaultSongLyrics), defaultSongMetadata: Object.values(songMetadata)[0] }
  }
}