import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { lyricsToWords } from "../lib/utils.js";

const RoundComplete = ({ userTyping, lyricsData, profanityHidden }) => {
  const [correct, setCorrect] = useState(0);
  const [mistyped, setMistyped] = useState(0);
  const [skipped, setSkipped] = useState(0);

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

      setCorrect((c) => c + correct.length);
      setSkipped((s) => s + skipped.length);
      setMistyped((m) => m + mistyped.length);
    }
  }, [userTyping, lyricsData]);

  return (
    <motion.div
      className={"text-xl my-5"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1>Round Complete</h1>
      <h2>Correct words: {correct}</h2>
      <h2>Skipped words: {skipped}</h2>
      <h2>Incorrect words: {mistyped}</h2>
    </motion.div>
  );
};

export default RoundComplete;
