import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Home() {
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    const getSong = async () => {
      const d = await fetch("/api/getLyrics?songName=Phoenix&artistName=A$AP%20Rocky").then(res => res.text());

      setLyrics(d)

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
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            Next.js!
          </a>
        </h1>

        <div className="flex justify-center items-center">
          <p>{lyrics}</p>
        </div>
      </main>

    </div>
  )
}
