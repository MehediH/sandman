import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";

const RoundComplete = ({
  userTyping,
  lyricsData,
  profanityHidden,
  roundDuration,
}) => {
  const [correct, setCorrect] = useState(0);
  const [mistyped, setMistyped] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmByBlock, setWPMByBlock] = useState([]);

  useEffect(() => {
    const lyrics = profanityHidden
      ? lyricsData.filteredLyrics
      : lyricsData.lyrics;

    const lyricsByWord = lyrics.map((l) => lyricsToWords(l.text));

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
      setWPMByBlock([...wpmByBlock, correct / (15) / 60])
      setCorrect((c) => c + correct.length);
      setSkipped((s) => s + skipped.length);
      setMistyped((m) => m + mistyped.length);
    }
    
    // cpm is char / (time / 60)
    // wpm is char / 5
    setTotalWPM(correct / (roundDuration / 60))
  }, [userTyping, lyricsData, roundDuration]);
  console.log(userTyping)
  return (
    <motion.div
      className={"text-xl my-5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {wpmByBlock.map((x, i) => {
        <p>{`Block ${i}: ${x}`}</p>
      })}
      <h1>Round Complete</h1>
      <h2>WPM: {correct / (roundDuration / 60)}</h2>
      <h2>Correct words: {correct}</h2>
      <h2>Skipped words: {skipped}</h2>
      <h2>Incorrect words: {mistyped}</h2>
      <h2>Time taken: {roundDuration} (in seconds)</h2>
    </motion.div>
  );
};

export default RoundComplete;
