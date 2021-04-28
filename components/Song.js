import { useState } from "react"

export default function Song({ data, currentlyPlaying=false }) {
    return (
        <div className="my-10 flex">
            <img
                src={data.albumArt}
                alt={`Cover of ${data.title}`}
                width={120}
                height={120}
                draggable={false}
                className="rounded-lg shadow-xl select-none"
            />

            <div className="flex flex-col ml-5">
                { currentlyPlaying && <span className="opacity-75">Currently Typing</span>}
                <h2 className="text-4xl">{data.title.split("by")[0]}</h2>
                <h2 className="text-md">by {data.title.split("by")[1].substr(1)}</h2>
            </div>
        </div>
    )
}
