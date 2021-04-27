import Head from 'next/head'
import { useEffect, useState } from 'react'
import Search from '../components/search';

const cleanLyrics = (text) => {
  // remove puntuation
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g,'')
  return text.replace(/\[.*?\]/g, '').toLowerCase();
};


export default function Home() {
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    const getSong = async () => {
      const d = await fetch("/api/getLyrics?songName=Phoenix&artistName=A$AP%20Rocky").then(res => res.text());

      setLyrics(cleanLyrics(d))
    }

    getSong();
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <Search/>
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
        </h1>

        <div className="flex justify-center items-center">
          <p className='text-2xl font-mono mx-24'>{lyrics}</p>
        </div>
      </main>

    </div>
  )
}

