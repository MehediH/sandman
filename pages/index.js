import Head from 'next/head'
import { useEffect, useState } from 'react'
import Lyrics from '../components/Lyrics';
import Search from '../components/search';
import Song from '../components/Song';
import { getLyricsFromGenius } from './api/getLyrics';
import { searchSongsOnGenius } from './api/searchSongs';
import { cleanLyrics } from '../lib/utils';
import LyricsPlaceholder from '../components/LyricsPlaceholder';

export default function Home({ defaultSongLyrics, defaultSongMetadata }) {
  const [ profanityHidden, setProfanityHidden ] = useState(true);
  const [ lyrics, setLyrics ] = useState(defaultSongLyrics);
  const [ lyricsLoading, setLyricsLoading ] = useState(false);

  const [ song, setSong ] = useState(defaultSongMetadata);

  const handleSongChange = async (song) => {
    setSong(song);
    setLyricsLoading(true);

    const songName = song.title.split("by")[0];
    const artistName = song.title.split("by")[1].substr(1);

    const lyrics = await fetch(`./api/getLyrics?songName=${songName}&artistName=${artistName}`).then(res => res.text());

    if(!lyrics) return;
    
    setLyrics(cleanLyrics(lyrics));
    setLyricsLoading(false);
  }

  return (
    <div className="bg-gradient-to-b from-purple-600 via-purple-400 to-purple-300 text-white min-h-screen">
      <Head>
        <title>sandman</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-20 max-w-screen-2xl m-auto flex flex-col">
        <div className="flex items-center">
          <h1 className="text-5xl select-none mr-5">🎧</h1>
          <Search selectSong={handleSongChange}/>
        </div>

        <Song data={song} currentlyPlaying={true}/>

        <label htmlFor="hideProfanity" className="opacity-70 hover:opacity-100 transition-all cursor-pointer">
          <input tabIndex="0" type="checkbox" id="hideProfanity" className="rounded-sm mr-2" onChange={() => {
            setProfanityHidden(h => !h)
          }} checked={profanityHidden}/>
          <span>Filter profanity</span>
        </label>
        
        {!lyricsLoading ? <Lyrics lyricsData={lyrics} profanityHidden={profanityHidden}/> : <LyricsPlaceholder/>}
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