import Head from 'next/head'
import { useEffect, useState } from 'react'
import Lyrics from '../components/Lyrics';
import Search from '../components/search';
import Song from '../components/Song';
import { getLyricsFromGenius } from './api/getLyrics';
import { searchSongsOnGenius } from './api/searchSongs';
import { cleanLyrics } from '../lib/utils';

export default function Home({ defaultSongLyrics, defaultSongMetadata }) {
  const [ profanityHidden, setPorfanityHidden ] = useState(true);

  return (
    <div className="bg-gradient-to-b from-purple-600 via-purple-400 to-purple-300 text-white">
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-20 max-w-screen-2xl m-auto flex flex-col h-screen">
        <div className="flex items-center">
          <h1 className="text-5xl select-none mr-5">🎧</h1>
          <Search/>
        </div>

        <Song data={defaultSongMetadata} currentlyPlaying={true}/>

        <label htmlFor="hideProfanity" className="opacity-70 hover:opacity-100 transition-all cursor-pointer">
          <input type="checkbox" id="hideProfanity" className="rounded-sm mr-2" onChange={() => {
            setPorfanityHidden(h => !h)
            console.log("hi")
          }} checked={profanityHidden}/>
          <span>Filter profanity</span>
        </label>

        <Lyrics lyricsData={defaultSongLyrics} profanityHidden={profanityHidden}/>
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

  const { lyrics, filteredLyrics} = cleanLyrics(defaultSongLyrics);

  return {
    props: { defaultSongLyrics: { lyrics, filteredLyrics }, defaultSongMetadata: Object.values(songMetadata)[0] }
  }
}