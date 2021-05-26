import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { lyricsToWords } from "../lib/utils";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const Lyrics = memo(function Lyrics({
  lyricsData,
  activeBlock,
  profanityHidden,
}) {
  const [lyricsByWord, setLyricsByWord] = useState(
    profanityHidden
      ? lyricsToWords(lyricsData.lyrics[activeBlock].text)
      : lyricsToWords(lyricsData.filteredLyrics[activeBlock].text)
  );

  const [lineBreaks, setLineBreaks] = useState([]);

  const [userTyping, setUserTyping] = useState([[]]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [caretPosition, setCaretPosition] = useState();
  const [isTyping, setIsTyping] = useState(false);

  const lyricsContainer = useRef(null);
  const typingObserver = useRef(null);
  const caretObserver = useRef(null);

  const handleUserKeyPress = useCallback((e) => {
    const { key, keyCode } = e;

    // don't track typing when the user is searching
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    // user is typing
    setIsTyping(true);

    caretObserver.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    // backspace, remove last char of last word
    if (keyCode === 8) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = prevUserTyping[prevUserTyping.length - 1];

          if (currentWord.length === 0) {
            let prevWord = prevUserTyping[prevUserTyping.length - 2];
            let actualPrevWord = lyricsByWord[prevUserTyping.length - 2];

            if (!prevWord) {
              prevUserTyping.pop();
              setActiveWordIndex((i) => Math.max(i - 1, 0));
            } else if (
              prevWord.length !== actualPrevWord.length ||
              prevWord.join("") !== actualPrevWord
            ) {
              setActiveWordIndex((i) => Math.max(i - 1, 0));
              prevUserTyping.pop();
            }
          } else {
            currentWord.pop();
            prevUserTyping[prevUserTyping.length - 1] = currentWord;
          }

          return [...prevUserTyping];
        } else {
          prevUserTyping.pop();
          setActiveWordIndex((i) => Math.max(i - 1, 0));
        }

        return [...prevUserTyping];
      });
    }

    // space, move to next word
    if (keyCode === 32) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping.length === lyricsByWord.length)
          return [...prevUserTyping];

        return [...prevUserTyping, []];
      });
      setActiveWordIndex((i) => Math.min(lyricsByWord.length - 1, i + 1));
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
      });
    }

    return () => {
      clearTimeout(caretObserver.current);
    };
  }, []);

  const trackTyping = () => {
    if (!lyricsContainer.current) return;

    // Select the node that will be observed for mutations
    const targetNode = lyricsContainer.current;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    // So we can track typing and the last active char / word
    const callback = function (mutationsList) {
      let lastChar = null;
      let activeWord = null;
      let isFirstWord = false;

      for (let mutation of mutationsList) {
        if (
          mutation.target.classList.contains("lastChar") &&
          mutation.target.classList.contains("opacity-100")
        ) {
          lastChar = mutation.target;
          break;
        }

        if (
          (!mutation.target.classList.contains("lastChar") &&
            mutation.target.classList.contains("opacity-50")) ||
          mutation.target.classList.contains("active")
        ) {
          const tempLastChar = mutation.target.querySelectorAll(
            ".opacity-100:last-child"
          )[0];

          const tempFirstchar =
            mutation.target.querySelectorAll(".opacity-50")[0];

          if (tempFirstchar) {
            activeWord = tempFirstchar;
            isFirstWord = true;
          } else if (tempLastChar) {
            activeWord = tempLastChar;
            isFirstWord = false;
          } else if (mutation.target.classList.contains("opacity-50")) {
            activeWord = mutation.target;
            isFirstWord = true;
          }

          break;
        }
      }

      if (lastChar) {
        const pos = lastChar.getBoundingClientRect();

        setCaretPosition({
          x: pos.left + pos.width,
          y: pos.top,
        });
      } else if (activeWord) {
        const pos = activeWord.getBoundingClientRect();

        setCaretPosition({
          x: isFirstWord ? pos.left : pos.left + pos.width,
          y: pos.top,
        });
      }
    };

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, config);

    return observer;
  };

  useEffect(() => {
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

    window.addEventListener("keydown", handleUserKeyPress);

    typingObserver.current = trackTyping();

    setUserTyping([[]]);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);

      if (typingObserver.current) {
        typingObserver.current.disconnect();
        typingObserver.current = null;
      }
    };
  }, [lyricsData, activeBlock, profanityHidden]);

  return (
    <div className="text-xl">
      {lyricsData && lyricsData.filteredLyrics && (
        <span className="block my-5">
          {lyricsData.filteredLyrics[activeBlock].block}
        </span>
      )}
      <ul className="flex flex-wrap" ref={lyricsContainer}>
        {lyricsByWord.map((word, wordIndex) => {
          // we iterate through each word and show each character
          return (
            <React.Fragment key={wordIndex}>
              {lineBreaks.includes(wordIndex) ? (
                <div
                  style={{ flexBasis: "100%", flexShrink: 0, flexGrow: 0 }}
                />
              ) : (
                ""
              )}
              <div
                className={`inline mr-1.5 ${
                  wordIndex === activeWordIndex ? "active" : ""
                }`}
              >
                {word.split("").map((char, charIndex) => {
                  return (
                    <span
                      key={charIndex}
                      className={`${
                        userTyping &&
                        userTyping.length > 0 &&
                        wordIndex <= activeWordIndex &&
                        userTyping[wordIndex] &&
                        charIndex < userTyping[wordIndex].length
                          ? userTyping[wordIndex][charIndex] === char
                            ? "opacity-100" // if char is correct in word
                            : "opacity-100 text-red-200" // if not
                          : "opacity-50"
                      } ${
                        wordIndex === activeWordIndex &&
                        userTyping[wordIndex] &&
                        charIndex === userTyping[wordIndex].length - 1
                          ? "lastChar"
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
                      <span
                        className={`opacity-100 text-red-200 ${
                          wordIndex === activeWordIndex ? "lastChar" : ""
                        }`}
                      >
                        {userTyping[wordIndex].slice(word.length)}
                      </span>
                    )
                }
              </div>
            </React.Fragment>
          );
        })}
      </ul>
      {caretPosition && (
        <div
          className={` w-1 h-5 mt-1.5 bg-gray-200 rounded-xl absolute ${
            !isTyping ? "animate-pulse" : ""
          }`}
          style={{
            left: caretPosition.x,
            top: caretPosition.y,
            transition: "left 0.1s linear, top 0.1s linear",
          }}
        ></div>
      )}
    </div>
  );
});

export default Lyrics;
