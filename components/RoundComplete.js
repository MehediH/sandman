import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { FiRotateCcw } from "react-icons/fi";

const RoundComplete = ({
  userTyping,
  lyricsData,
  blockTitles,
  profanityHidden,
  blockStartTimes,
  restartRound,
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

        if (!userBlock || !lyricBlock) continue;

        const correctWords = userBlock.filter(
          (w, i) =>
            lyricBlock.length !== 0 &&
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
            ((lyricBlock.length !== 0 && lyricBlock[i].length !== w.length) ||
              lyricBlock[i] !== w.join("")) &&
            w.length != 0
        );

        const correctCharacters = userBlock.reduce((acc, currentWord, i) => {
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

  return (
    <motion.div
      className={"text-xl my-5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-dela">Round Complete</h1>

      {wpmByBlock.map((x, i) => {
        return <h2 key={`block=${i}`}>{`${x.id}: ${x.wpm} WPM`}</h2>;
      })}

      <h2>WPM: {totalWPM}</h2>
      <h2>Correct words: {correctWords}</h2>
      <h2>Skipped words: {skippedWords}</h2>
      <h2>Incorrect words: {mistypedWords}</h2>
      <h2>Time taken: {roundDuration} (in seconds)</h2>

      <div className="flex items-center mt-5">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-code py-2 px-4 rounded-full flex items-center transition-all ease-in-out focus:outline-none focus:ring-4 ring-purple-200 mr-5"
          onClick={restartRound}
          ref={retryButton}
        >
          <FiRotateCcw className="mr-2" /> Try again
        </button>
        <p className="opacity-75 ">Hit space to restart</p>
      </div>
    </motion.div>
  );
};

export default RoundComplete;
