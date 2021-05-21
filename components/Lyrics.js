import { useEffect, useState, useCallback, memo } from "react";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const Lyrics = memo(function Lyrics({ lyricsData, profanityHidden }) {
  const [lyrics, setLyrics] = useState([]);
  const [lyricsByWord, setLyricsByWord] = useState([]);
  const [userTyping, setUserTyping] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState("");

  const handleUserKeyPress = useCallback((e) => {
    const { key, keyCode } = e;

    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    // backspace, remomve last char of last word
    if (keyCode === 8) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = prevUserTyping[prevUserTyping.length - 1];

          if (currentWord.length > 0) {
            currentWord.pop();
            prevUserTyping[prevUserTyping.length - 1] = currentWord;
          } else if (prevUserTyping.length > 2) {
            console.log(lyricsByWord);
          }

          return [...prevUserTyping];
        }

        return prevUserTyping;
      });
    }

    // space, move to next word
    if (keyCode === 32) {
      setUserTyping((prevUserTyping) => [...prevUserTyping, []]);
      setActiveWordIndex((i) => (i += 1));
    }

    if (keyCode >= 65 && keyCode <= 90) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = [...prevUserTyping[prevUserTyping.length - 1], key];
          prevUserTyping[prevUserTyping.length - 1] = currentWord;
          return [...prevUserTyping];
        }

        return [[key]];
      });
    }
  }, []);

  useEffect(() => {
    if (profanityHidden) {
      let filteredLyrics = lyricsData.filteredLyrics
        .replace("\n", "")
        .split(/\s+/);
      setLyricsByWord(filteredLyrics);
      setActiveWordIndex(0);
    } else {
      setLyrics(lyricsData.lyrics.split(""));
    }

    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [lyricsData, profanityHidden]);

  return (
    <ul className="flex flex-wrap text-xl">
      {lyricsByWord.map((word, wordIndex) => {
        return (
          <div className="inline pr-2" key={wordIndex}>
            {word.split("").map((char, charIndex) => {
              return (
                <span
                  key={charIndex}
                  className={`opacity-50 ${
                    userTyping.length > 0 &&
                    wordIndex <= activeWordIndex &&
                    charIndex < userTyping[wordIndex].length
                      ? userTyping[wordIndex][charIndex] === char
                        ? "opacity-100"
                        : "opacity-100 text-red-200"
                      : ""
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}
    </ul>
  );
});

export default Lyrics;
