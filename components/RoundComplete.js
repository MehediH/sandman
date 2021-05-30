import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { FiRotateCcw } from "react-icons/fi";

const RoundComplete = ({
  userTyping,
  lyricsData,
  profanityHidden,
  blockStartTimes,
  restartRound,
}) => {
  const [correct, setCorrect] = useState(0);
  const [mistyped, setMistyped] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmByBlock, setWPMByBlock] = useState([]);

  const [durationByBlock, setDurationByBlock] = useState([]);
  const [roundDuration, setRoundDuration] = useState(0);

  const retryButton = useRef(null);

  const calculateDurationByBlock = async (blockStartTimes) => {
    const blockDurations = [];

    await blockStartTimes.map((blockTime, i) => {
      if (i + 1 < blockStartTimes.length) {
        blockDurations.push(
          differenceInSeconds(blockStartTimes[i + 1], blockTime)
        );
      } else {
        blockDurations.push(differenceInSeconds(new Date(), blockTime));
      }
    });

    return blockDurations;
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

        const correct = userBlock.filter(
          (w, i) =>
            lyricBlock.length !== 0 &&
            lyricBlock[i].length === w.length &&
            lyricBlock[i] === w.join("")
        );

        const skipped = lyricBlock.filter(
          (w, i) => i >= userBlock.length || userBlock[i]?.length === 0
        );

        const mistyped = userBlock.filter(
          (w, i) =>
            (lyricBlock.length !== 0 && lyricBlock[i].length !== w.length) ||
            lyricBlock[i] !== w.join("")
        );

        setCorrect((c) => {
          totalCorrect = c + correct.length;
          return c + correct.length;
        });
        setSkipped((s) => s + skipped.length);
        setMistyped((m) => m + mistyped.length);

        const wpmForBlock = Math.round(
          correct.length / (blockDurations[i] / 60)
        );

        if (wpmForBlock >= 0) {
          setWPMByBlock((wpmByBlock) => [...wpmByBlock, wpmForBlock]);
        }
      }

      // cpm is char / (time / 60)
      // wpm is char / 5
      const roundDuration = blockDurations.reduce((a, b) => a + b, 0);
      setRoundDuration(roundDuration);
      setTotalWPM(Math.round(totalCorrect / (roundDuration / 60)));
    };

    calculateStats();

    retryButton.current.focus();
  }, [userTyping, lyricsData, blockStartTimes]);

  return (
    <motion.div
      className={"text-xl my-5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-dela">Round Complete</h1>

      {wpmByBlock.map((x, i) => {
        return <h2 key={`block=${i}`}>{`Block ${i + 1}: ${x} WPM`}</h2>;
      })}

      {/* THIS SHIT DOESN'T WORK */}
      <h2>WPM: {totalWPM}</h2>
      <h2>Correct words: {correct}</h2>
      <h2>Skipped words: {skipped}</h2>
      <h2>Incorrect words: {mistyped}</h2>
      <h2>Time taken: {roundDuration} (in seconds)</h2>

      <div className="flex items-center mt-5">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-code py-2 px-4 rounded-full flex items-center transition-all ease-in-out focus:outline-none focus:ring ring-4 ring-purple-200 mr-5"
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
