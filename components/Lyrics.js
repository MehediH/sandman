import { useEffect, useState } from "react"

// lyricsData is an Object with `lyrics` and `filteredLyrics`
export default function Lyrics({ lyricsData, profanityHidden }) {
    const [ lyrics, setLyrics ] = useState("Loading...");

    useEffect(() => {
        if(profanityHidden) {
            setLyrics(lyricsData.filteredLyrics);
        } else{
            setLyrics(lyricsData.lyrics);
        }
    })

    return (
        <p className='text-2xl font-mono text-left items-center mt-20'>{ lyrics }</p>
    )
}
