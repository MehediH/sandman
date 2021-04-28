import { useEffect, useState } from "react"

export default function Song({ data, currentlyPlaying=false }) {
    const [ songData, setSongData ] = useState();
    const [ songFeatures, setSongFeatures ] = useState({});

    useEffect(() => {
        setSongData(data);

        const getSpotifyData = async () => {
            const { data: searchForSong, err } = await fetch(`/api/searchSpotify?q=${data.title}`).then(res => res.json());

            if(err || searchForSong.length === 0){
                setSongFeatures(null);
                return;
            };

            if(searchForSong && searchForSong[0].id){
                const { data: songFeatures, err } = await fetch(`/api/getSongFeatures?id=${searchForSong[0].id}`).then(res => res.json());

                if(err) return;

                setSongFeatures(songFeatures);
            }
        }

        getSpotifyData();
    }, [ data ]);

    if(!songData) return null;

    return (
        <div className="my-10 flex">
            <img
                src={songData.albumArt}
                alt={`Cover of ${songData.title}`}
                width={120}
                height={120}
                draggable={false}
                className="rounded-lg shadow-xl select-none"
            />

            <div className="flex flex-col ml-5">
                { currentlyPlaying && <span className="opacity-75">Currently Typing</span>}
                <h2 className="text-4xl">{songData.title.split("by")[0]}</h2>
                <h2 className="text-md mt-2">by {songData.title.split("by")[1].substr(1)}</h2>

                { songFeatures && <span>{Math.round(songFeatures.tempo)} BPM</span>}
            </div>
        </div>
    )
}
