import { getSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import {
  FiPauseCircle,
  FiPlayCircle,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { takeOver } from "../lib/initPlayer";

export default function PlaybackControl({ playingState, uri, deviceSwitched }) {
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(50);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;

      const access_token = session.user.access_token;

      if (!playingState?.tracks || playingState.tracks.uri != uri) {
        takeOver(access_token, playingState.deviceId, uri);
      }
    });

    const checkState = setInterval(() => {
      window.player.getCurrentState().then((state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          );
          deviceSwitched();
          return;
        }

        if (duration === 0) setDuration(state.duration);

        setProgress(state.position);
      });
    }, 1000);

    window.player.getVolume().then((v) => setVolume(v * 100));

    return () => clearInterval(checkState);
  }, []);

  const convertMS = (milliseconds) => {
    let hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    hour = hour % 24;

    const pad = (size, value) => {
      let s = String(value);
      while (s.length < (size || 2)) {
        s = "0" + s;
      }
      return s;
    };

    return `${minute}:${pad(2, seconds)}`;
  };

  const togglePlayback = () => {
    window.player.togglePlay();
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (m) {
        setVolume(volumeBeforeMute);
        window.player.setVolume(volumeBeforeMute / 100);
      } else {
        setVolumeBeforeMute(volume);
        setVolume(0);
        window.player.setVolume(0.000001);
      }

      return !m;
    });
  };

  const handleSeek = (e) => {
    const pos =
      (e.clientX - e.target.getBoundingClientRect().left) /
      e.target.getBoundingClientRect().width;

    window.player.seek(Math.round(pos * duration));
  };

  const handleVolume = (e) => {
    let pos =
      (e.clientX - e.target.getBoundingClientRect().left) /
      e.target.getBoundingClientRect().width;

    pos = Math.min(Math.max(pos, 0), 1);

    window.player.setVolume(pos);
    setVolume(pos * 100);
  };

  return (
    <div className="my-5">
      <span className="flex items-center mb-2 font-dela">
        <FaSpotify className="mr-2" size="20" /> Playing on Spotify
        <p className="justify-end flex-grow flex opacity-75">80BPM</p>
      </span>
      <div className="flex border-2 border-green-500 rounded-md shadow-lg self-start px-5 py-2 items-center w-80">
        <div className="flex flex-col flex-auto">
          <ProgressBar
            onSeek={handleSeek}
            progress={progress}
            total={duration}
            displayedProgress={convertMS(progress)}
            displayedTotal={convertMS(duration)}
          >
            <span
              onClick={togglePlayback}
              className="text-2xl hover:opacity-75 cursor-pointer transition ease-in-out mr-4"
            >
              {playingState?.paused ? <FiPlayCircle /> : <FiPauseCircle />}
            </span>
          </ProgressBar>

          <ProgressBar
            onSeek={handleVolume}
            progress={volume}
            total={100}
            displayedProgress={`${parseFloat(volume).toFixed(0)}%`}
            displayedTotal={`100%`}
          >
            <span
              onClick={toggleMute}
              className="text-2xl hover:opacity-75 cursor-pointer transition ease-in-out mr-4"
            >
              {!muted ? <FiVolume2 /> : <FiVolumeX />}
            </span>
          </ProgressBar>
        </div>
      </div>
    </div>
  );
}

const ProgressBar = ({
  onSeek,
  progress,
  total,
  displayedProgress,
  displayedTotal,
  children,
}) => {
  return (
    <div className="flex items-center">
      {children}
      <div className="relative pt-1 flex-grow">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-700 bg-green-100">
              {displayedProgress}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-white">
              {displayedTotal}
            </span>
          </div>
        </div>
        <div
          className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-400"
          onClick={onSeek}
        >
          <div
            style={{
              width: Number.isNaN((progress / total) * 236)
                ? "0%"
                : (progress / total) * 236,
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-700"
          ></div>
        </div>
      </div>
    </div>
  );
};
