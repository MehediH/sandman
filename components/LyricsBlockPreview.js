import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { lyricsToWords } from "../lib/utils";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const LyricsBlockPreview = ({ lyricsData, activeBlock, profanityHidden }) => {
  const [lyricsByWord, setLyricsByWord] = useState([]);

  const [lineBreaks, setLineBreaks] = useState([]);

  useEffect(() => {
    const lyricsByWord = profanityHidden
      ? lyricsToWords(lyricsData.filteredLyrics[activeBlock].text)
      : lyricsToWords(lyricsData.lyrics[activeBlock].text);

    setLyricsByWord(lyricsByWord);

    const l = lyricsData.filteredLyrics[activeBlock].text
      .split("\n")
      .filter((l) => l != "")
      .map((l) => l.split(" "));

    setLineBreaks(
      []
        .concat(...l.map((n) => [n, "\n"]))
        .slice(0, -1)
        .flat()
        .map((l, i) => (l === "\n" ? i : null))
        .filter((l) => l !== null)
    );
  }, [lyricsData, activeBlock, profanityHidden]);

  return (
    <div className="text-xl opacity-30">
      {lyricsData && lyricsData.filteredLyrics && (
        <span className="block my-5">
          {lyricsData.filteredLyrics[activeBlock].block}
        </span>
      )}
      <ul className="flex flex-wrap">
        {lyricsByWord.map((word, wordIndex) => {
          return (
            <React.Fragment key={wordIndex}>
              {lineBreaks.includes(wordIndex) ? (
                <div
                  style={{ flexBasis: "100%", flexShrink: 0, flexGrow: 0 }}
                />
              ) : null}
              <div className="inline mr-1.5">
                {word.split("").map((char, charIndex) => {
                  return <span key={charIndex}>{char}</span>;
                })}
              </div>
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default LyricsBlockPreview;
