import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { FiRotateCcw } from "react-icons/fi";
import RelatedSongs from "../components/RelatedSongs";
import RoundBreakdownChart from "./RoundBreakdownChart"

const RoundComplete = ({
  userTyping,
  lyricsData,
  blockTitles,
  profanityHidden,
  blockStartTimes,
  restartRound,
  handleSongChange,
  songData
}) => {
  const [correctWords, setCorrectWords] = useState(0);
  const [mistypedWords, setMistypedWords] = useState(0);
  const [skippedWords, setSkippedWords] = useState(0);
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmByBlock, setWPMByBlock] = useState([]);
  const [correctChars, setCorrectChars] = useState(0);

  const [durationByBlock, setDurationByBlock] = useState([]);
  const [roundDuration, setRoundDuration] = useState(0);

  const retryButton = useRef(null);

  const calculateDurationByBlock = async (blockStartTimes) => {
    const blockDurations = [];

    if (!blockStartTimes) return [];

    await blockStartTimes.map((blockTime, i) => {
      if (i + 1 < blockStartTimes.length) {
        blockDurations.push(
          differenceInSeconds(blockStartTimes[i + 1], blockTime)
        );
      } else {
        blockDurations.push(differenceInSeconds(new Date(), blockTime));
      }
    });

    return blockDurations.map((t) => Math.max(1, t));
  };

  useEffect(() => {
    const lyrics = profanityHidden
      ? lyricsData.filteredLyrics
      : lyricsData.lyrics;

    const lyricsByWord = lyrics.map((l) => lyricsToWords(l.text));

    const calculateStats = async () => {
      const blockDurations = await calculateDurationByBlock(blockStartTimes);

      setDurationByBlock(blockDurations);

      let totalCorrect = 0;

      for (let i = 0; i < userTyping.length; i++) {
        const userBlock = userTyping[i];
        const lyricBlock = lyricsByWord[i];

        if (!Array.isArray(userBlock) || !Array.isArray(lyricBlock)) continue;

        const correctWords = userBlock.filter(
          (w, i) =>
            lyricBlock.length !== 0 &&
            lyricBlock[i] &&
            lyricBlock[i].length === w.length &&
            lyricBlock[i] === w.join("")
        );

        const lastTypedWordIndex = userBlock
          .map((w) => w.length != 0)
          .lastIndexOf(true);

        const skippedWords = userBlock.filter(
          (w, i) => w.length === 0 && i < lastTypedWordIndex
        );

        const mistypedWords = userBlock.filter(
          (w, i) =>
            ((lyricBlock.length !== 0 && lyricBlock[i] && lyricBlock[i].length !== w.length) ||
              lyricBlock[i] !== w.join("")) &&
            w.length != 0
        );

        const correctCharacters = userBlock.reduce((acc, currentWord, i) => {
          if (!lyricBlock[i]) return 0;

          const numOfCurrentCharsInWord = lyricBlock[i]
            .split("")
            .reduce((acc, currentLetter, letterIndex) => {
              if (currentLetter === currentWord[letterIndex]) return acc + 1;

              return acc;
            }, 0);

          return acc + numOfCurrentCharsInWord;
        }, 0);

        setCorrectChars((c) => {
          totalCorrect = correctCharacters + c;

          return correctCharacters + c;
        });

        setCorrectWords((c) => c + correctWords.length);

        setSkippedWords((s) => s + skippedWords.length);

        setMistypedWords((m) => m + mistypedWords.length);

        // (result.correctChars * (60 / result.testDuration)) / 5
        const wpmForBlock = Math.round(
          (correctCharacters * (60 / blockDurations[i])) / 5
        );

        if (wpmForBlock >= 0 && wpmForBlock != Infinity) {
          setWPMByBlock((wpmByBlock) => [
            ...wpmByBlock,
            { id: blockTitles[i], wpm: wpmForBlock },
          ]);
        }
      }

      const roundDuration = blockDurations.reduce((a, b) => a + b, 0);
      setRoundDuration(roundDuration);

      const wpm = Math.round((totalCorrect * (60 / roundDuration)) / 5);
      setTotalWPM(Number.isNaN(wpm) ? 0 : wpm);
    };

    calculateStats();

    retryButton.current.focus();
  }, []);

  const MetricHighlight = ({ title, metricValue }) => {
    return (
      <li className="w-40 bg-green-500 rounded-lg overflow-hidden mr-2">
        <span className="block bg-green-600 p-2 text-sm font-semibold">{title}</span>
        <h4 className="p-2 font-bold">{metricValue}</h4>
      </li>
    )
  }

  return (
    <motion.div
      className={"text-xl my-5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-dela">Round Complete</h1>
      <div className="flex items-center my-5 flex-wrap">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-code py-2 px-4 rounded-full flex items-center transition-all ease-in-out focus:outline-none focus:ring-4 ring-purple-200 mr-5"
          onClick={restartRound}
          ref={retryButton}
        >
          <FiRotateCcw className="mr-2" /> Try again
        </button>
        <p className="opacity-75 ">Hit space to restart :)</p>
      </div>

      <ul className="flex mb-5">
        <MetricHighlight title="WPM" metricValue={totalWPM} />
        <MetricHighlight title="Correct Words" metricValue={correctWords} />
        <MetricHighlight title="Skipped Words" metricValue={skippedWords} />
        <MetricHighlight title="Incorrect Words" metricValue={mistypedWords} />
        <MetricHighlight title="Time Taken" metricValue={roundDuration + "s"} />
      </ul>

      <RelatedSongs artistName={songData?.title.split(" by")[1]} handleSongChange={handleSongChange} />

      <h2 className="text-xl font-dela mb-2 mt-0">Per-Block Breakdown</h2>

      <RoundBreakdownChart data={wpmByBlock.map((d, index) => ({ ...d, id: `B${index + 1}` }))} />

      {wpmByBlock && <ul>
        {wpmByBlock.map((block, index) => {
          return (
            <li
              key={`${index}-${block.id}`}
              className="text-base mb-1"
            >
              <span className="bg-gray-800 rounded-sm px-2 py-0.5 text-sm mr-2">{`B${index + 1}`}</span>
              {`${block.id}: ${block.wpm} WPM`}
            </li>
          );
        })}
      </ul>}


    </motion.div>
  );
};

export default RoundComplete;
