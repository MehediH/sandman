import { useEffect, useState } from "react"


function LyricList({lyricsData, profanityHidden}) {
    useEffect(() => {
        if(profanityHidden) {
            setLyrSplit(lyricsData.filteredLyrics.split(' '));
        } else{
            setLyrSplit(lyricsData.lyrics.split(' '));
        }
    })

    return (
        <ul>{lyrSplit.map((x) => {
            return <li className='inline pl-1'>{x.split('').map((i) => {
                return <span>{i}</span>
            })}</li>
        })}</ul>
    )
}

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