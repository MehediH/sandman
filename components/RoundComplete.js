import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";
import differenceInSeconds from "date-fns/differenceInSeconds";

const RoundComplete = ({
  userTyping,
  lyricsData,
  profanityHidden,
  blockStartTimes,
}) => {
  const [correct, setCorrect] = useState(0);
  const [mistyped, setMistyped] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmByBlock, setWPMByBlock] = useState([]);

  const [durationByBlock, setDurationByBlock] = useState([]);
  const [roundDuration, setRoundDuration] = useState(0);

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
            lyricBlock[i].length === w.length && lyricBlock[i] === w.join("")
        );

        const skipped = lyricBlock.filter(
          (w, i) => i >= userBlock.length || userBlock[i]?.length === 0
        );

        const mistyped = userBlock.filter(
          (w, i) =>
            lyricBlock[i].length !== w.length || lyricBlock[i] !== w.join("")
        );

        setCorrect((c) => {
          totalCorrect = c + correct.length;
          return c + correct.length;
        });
        setSkipped((s) => s + skipped.length);
        setMistyped((m) => m + mistyped.length);

        setWPMByBlock((wpmByBlock) => [
          ...wpmByBlock,
          Math.round(correct.length / (blockDurations[i] / 60)),
        ]);
      }

      // cpm is char / (time / 60)
      // wpm is char / 5
      const roundDuration = blockDurations.reduce((a, b) => a + b, 0);
      setRoundDuration(roundDuration);
      setTotalWPM(totalCorrect / (roundDuration / 60));
    };

    calculateStats();
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
        return <h2 key={i}>{`Block ${i + 1}: ${x} WPM`}</h2>;
      })}

      {/* THIS SHIT DOESN'T WORK */}
      <h2>WPM: {totalWPM}</h2>
      <h2>Correct words: {correct}</h2>
      <h2>Skipped words: {skipped}</h2>
      <h2>Incorrect words: {mistyped}</h2>
      <h2>Time taken: {roundDuration} (in seconds)</h2>
    </motion.div>
  );
};

export default RoundComplete;
