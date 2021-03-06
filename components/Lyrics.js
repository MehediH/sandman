import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { lyricsToWords } from "../lib/utils.js";
import { motion, useAnimation } from "framer-motion";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const Lyrics = memo(function Lyrics({
  lyricsData,
  activeBlock,
  profanityHidden,
  blockComplete,
  finishRound,
  startInitialTimer,
}) {
  const [lyricsByWord, setLyricsByWord] = useState([]);

  const [lineBreaks, setLineBreaks] = useState([]);

  const [userTyping, setUserTyping] = useState([[]]);
  const [caretPosition, setCaretPosition] = useState();
  const [cursorShake, setCursorShake] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isBlockComplete, setIsBlockComplete] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [mounted, setMounted] = useState(true);

  const lyricsContainer = useRef(null);
  const typingObserver = useRef(null);
  const caretObserver = useRef(null);

  const lyricsAnimControl = useAnimation();
  const caretAnimControl = useAnimation();

  const handleUserKeyPress = useCallback((e, lyricsByWord) => {
    if (!mounted) return;

    const { key, keyCode } = e;

    // don't track typing when the user is searching
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    // user is typing
    setIsTyping(true);

    caretObserver.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    let typingShakeTimeout;

    if (e.ctrlKey && keyCode === 13) {
      setIsBlockComplete(true);
      return;
    }

    if (keyCode === 13) {
      setIsRoundComplete(true);
      return;
    }

    // backspace, remove last char of last word
    if (keyCode === 8) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = prevUserTyping[prevUserTyping.length - 1];

          if (currentWord.length === 0) {
            let prevWord = prevUserTyping[prevUserTyping.length - 2];
            let actualPrevWord = lyricsByWord[prevUserTyping.length - 2];

            if (
              (!prevWord ||
                prevWord.length !== actualPrevWord.length ||
                prevWord.join("") !== actualPrevWord) &&
              prevUserTyping.length !== 1
            ) {
              prevUserTyping.pop();
            } else {
              setCursorShake(true);
              typingShakeTimeout = setTimeout(() => {
                setCursorShake(false);
              }, 800);
            }
          } else {
            currentWord.pop();

            if (prevUserTyping.length === 1 && currentWord.length === 0) {
              currentWord = [];
            }

            prevUserTyping[prevUserTyping.length - 1] = currentWord;
          }
        }

        return [...prevUserTyping];
      });
    }

    // space, move to next word
    if (keyCode === 32) {
      e.preventDefault();

      setUserTyping((prevUserTyping) => {
        if (prevUserTyping.length === lyricsByWord.length) {
          setIsBlockComplete(true);
          return [...prevUserTyping];
        }

        return [...prevUserTyping, []];
      });
    }

    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57)) {
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
      clearTimeout(typingShakeTimeout);
    };
  });

  const trackTyping = () => {
    if (!lyricsContainer.current) return;

    // Select the node that will be observed for mutations
    const targetNode = lyricsContainer.current;

    const observer = new MutationObserver(moveCursor);

    observer.observe(targetNode, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return observer;
  };

  const moveCursor = () => {
    if (!lyricsContainer.current) return;

    const activeElem = lyricsContainer.current.querySelectorAll(".active")[0];
    const lastChar = lyricsContainer.current.querySelectorAll(".lastChar")[0];

    if (lastChar) {
      let pos = lastChar.getBoundingClientRect();

      setCaretPosition({
        x: lastChar.offsetLeft + pos.width,
        y: lastChar.offsetTop,
      });
    } else if (activeElem && activeElem.offsetLeft !== 0) {
      setCaretPosition(caretPosition => ({ x: activeElem.offsetLeft, y: activeElem.offsetTop }));
    }
  };

  const handleInitialStart = (e) => {
    // don't track typing when the user is searching
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    const { keyCode } = e;
    if (
      ((keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 48 && keyCode <= 57) ||
        keyCode === 32 ||
        keyCode === 8) &&
      userTyping.length === 1 &&
      userTyping[0].length === 0
    ) {
      startInitialTimer();
      window.removeEventListener("keydown", handleInitialStart);
    }
  };

  const animateAndCompleteBlock = async () => {
    await caretAnimControl.start({ opacity: 0 }); // fade out caret

    await lyricsAnimControl.start({ y: -20, opacity: 0 }); // fade out current block
    await lyricsAnimControl.start({ y: 20, opacity: 0 }); // move back to position

    blockComplete(userTyping); // fetch new block

    await lyricsAnimControl.start({ y: 0, opacity: 1 }); // fade in new block
    await caretAnimControl.start({ opacity: 1 }); // fade back caret
  };

  useEffect(() => {
    if (isBlockComplete) {
      animateAndCompleteBlock();
    }

    if (isRoundComplete) finishRound(userTyping);

    setUserTyping([[]]);
    setIsBlockComplete(false);
    setMounted(true);

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

    const proxyKeyPress = (e) => handleUserKeyPress(e, lyricsByWord);

    window.addEventListener("keydown", proxyKeyPress);

    if (activeBlock === 0)
      window.addEventListener("keydown", handleInitialStart);

    window.addEventListener("resize", moveCursor);

    typingObserver.current = trackTyping();

    return () => {
      window.removeEventListener("keydown", proxyKeyPress);

      if (activeBlock === 0)
        window.removeEventListener("keydown", handleInitialStart);

      window.removeEventListener("resize", moveCursor);

      if (typingObserver.current) {
        typingObserver.current.disconnect();
        typingObserver.current = null;
      }

      setMounted(false);
    };
  }, [
    lyricsData,
    activeBlock,
    profanityHidden,
    isBlockComplete,
    isRoundComplete,
  ]);

  return (
    <div>
      <div className="text-xl font-code" animate={lyricsAnimControl}>
        {lyricsData && lyricsData.filteredLyrics && (
          <span className="block my-5 font-dela tracking-wider">
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
                ) : null}
                <div
                  className={`flex items-center mr-1.5 ${wordIndex === userTyping.length - 1 ? "active" : ""
                    }`}
                >
                  {word.split("").map((char, charIndex) => {
                    return (
                      <span
                        key={charIndex}
                        className={`${userTyping?.length > 0 &&
                          wordIndex <= userTyping.length - 1 &&
                          charIndex < userTyping[wordIndex]?.length
                          ? userTyping[wordIndex][charIndex] === char
                            ? "opacity-100" // if char is correct in word
                            : "opacity-100 text-red-200" // if not
                          : "opacity-50"
                          } ${wordIndex === userTyping.length - 1 &&
                            charIndex === userTyping[wordIndex]?.length - 1
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
                    userTyping[wordIndex]?.length > word.length && (
                      <span
                        className={`opacity-100 text-red-200 ${wordIndex === userTyping.length - 1 ? "lastChar" : ""
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
      </div>
      {caretPosition && (
        <motion.div
          className={`w-1 h-5 mt-1 bg-gray-200 rounded-extraLarge absolute ${!isTyping ? "animate-pulse" : ""
            } ${cursorShake ? "animate-shake" : ""}`}
          style={{
            left: caretPosition.x,
            top: caretPosition.y,
            transition: "left 0.1s linear, top 0.1s linear",
          }}
          animate={caretAnimControl}
        ></motion.div>
      )}
    </div>
  );
});

export default Lyrics;
