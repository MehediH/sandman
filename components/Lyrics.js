import { useEffect, useState, useCallback, memo } from "react";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const Lyrics = memo(function Lyrics({ lyricsData, profanityHidden }) {
  const [lyrics, setLyrics] = useState([]);
  const [lyricsByWord, setLyricsByWord] = useState([]);
  const [userTyping, setUserTyping] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState("");

  const handleUserKeyPress = useCallback((e) => {
    const { key, keyCode } = e;

    // don't track typing when the user is searching
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    // backspace, remove last char of last word
    if (keyCode === 8) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = prevUserTyping[prevUserTyping.length - 1];
          currentWord.pop();
          prevUserTyping[prevUserTyping.length - 1] = currentWord;

          // if we reach end of currently active word, we move to the last word
          if (currentWord.length === 0) {
            setActiveWordIndex((i) => Math.max(i - 1, 0));
            prevUserTyping.pop();
            return [...prevUserTyping];
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
        // if we have some typed character
        if (prevUserTyping[prevUserTyping.length - 1]) {
          // update current word and what the userh as typed so far
          let currentWord = [...prevUserTyping[prevUserTyping.length - 1], key];

          prevUserTyping[prevUserTyping.length - 1] = currentWord;
          return [...prevUserTyping];
        }

        return [[key]]; // first char of first word
      });
    }
  }, []);

  useEffect(() => {
    let formattedLyrics = [];

    if (profanityHidden) {
      formattedLyrics = lyricsData.filteredLyrics
        .replace("\n", "")
        .replace(/\*/g, "")
        .split(/\s+/);
    } else {
      formattedLyrics = lyricsData.lyrics.replace("\n", "").split(/\s+/);
    }

    setLyricsByWord(formattedLyrics);
    setActiveWordIndex(0);
    setUserTyping([]);

    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [lyricsData, profanityHidden]);

  return (
    <ul className="flex flex-wrap text-xl">
      {lyricsByWord.map((word, wordIndex) => {
        // we iterate through each word and show each character
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
                        ? "opacity-100" // if char is correct in word
                        : "opacity-100 text-red-200" // if not
                      : ""
                  }`}
                >
                  {char}
                </span>
              );
            })}
            {
              // display any additional characters the user types for a given word
              userTyping[wordIndex] &&
                userTyping[wordIndex].length > word.length && (
                  <span className="opacity-100 text-red-200">
                    {userTyping[wordIndex].slice(word.length)}
                  </span>
                )
            }
          </div>
        );
      })}
    </ul>
  );
});

export default Lyrics;
