import { useEffect, useState, useCallback, memo, useRef } from "react";

// lyricsData is an Object with `lyrics` and `filteredLyrics`
const Lyrics = memo(function Lyrics({ lyricsData, profanityHidden }) {
  const [lyricsByWord, setLyricsByWord] = useState(
    profanityHidden ? lyricsData.filteredLyrics : lyricsData.lyrics
  );
  const [userTyping, setUserTyping] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const lyricsContainer = useRef(null);
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 });

  const handleUserKeyPress = useCallback((e) => {
    const { key, keyCode } = e;

    // don't track typing when the user is searching
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;

    // backspace, remove last char of last word
    if (keyCode === 8) {
      setUserTyping((prevUserTyping) => {
        if (prevUserTyping[prevUserTyping.length - 1]) {
          let currentWord = prevUserTyping[prevUserTyping.length - 1];

          if (currentWord.length === 0) {
            let prevWord = prevUserTyping[prevUserTyping.length - 2];
            let actualPrevWord = lyricsByWord[prevUserTyping.length - 2];

            if (
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
        }

        return prevUserTyping;
      });

      // setCaretPosition((pos) => {
      //   return {
      //     ...pos,
      //     x: Math.max(
      //       pos.x - 8,
      //       lyricsContainer.current.getBoundingClientRect().left
      //     ),
      //   };
      // });
    }

    // space, move to next word
    if (keyCode === 32) {
      setUserTyping((prevUserTyping) => [...prevUserTyping, []]);
      setActiveWordIndex((i) => (i += 1));

      // setCaretPosition((pos) => {
      //   return {
      //     ...pos,
      //     x: pos.x + 8,
      //   };
      // });
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
    window.addEventListener("keydown", handleUserKeyPress);

    // Select the node that will be observed for mutations
    const targetNode = lyricsContainer.current;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      let lastChar = null;

      for (let mutation of mutationsList) {
        if (mutation.target.classList.contains("lastChar")) {
          lastChar = mutation.target;
          break;
        }
      }

      if (lastChar) {
        const pos = lastChar.getBoundingClientRect();
        setCaretPosition({
          x: pos.left + pos.width,
          y: pos.top,
        });
      }

      console.log(lastChar);
      // if (mutationsList.length > 0) {
      //   const elem = mutationsList[mutationsList.length - 1].target;
      //   const pos = elem.getBoundingClientRect();

      //   // console.log(elem.classList);
      //   // console.log(mutationsList);

      //   // setCaretPosition({
      //   //   x: elem.classList.contains("opacity-100")
      //   //     ? pos.left + pos.width
      //   //     : pos.left,
      //   //   y: pos.top,
      //   // });

      //   // caret.current = mutationsList[0].target;
      // }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    observer.observe(targetNode, config);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
      observer.disconnect();
      setUserTyping([]);
      setCaretPosition({ x: 0, y: 0 });
    };
  }, [lyricsData, profanityHidden]);

  return (
    <div className="">
      <ul className="flex flex-wrap text-xl" ref={lyricsContainer}>
        {lyricsByWord.map((word, wordIndex) => {
          // we iterate through each word and show each character
          return (
            <div
              className={`inline pr-2 ${
                wordIndex === activeWordIndex ? "active" : ""
              }`}
              key={wordIndex}
            >
              {word.split("").map((char, charIndex) => {
                return (
                  <span
                    key={charIndex}
                    className={`opacity-50 ${
                      userTyping.length > 0 &&
                      wordIndex <= activeWordIndex &&
                      userTyping[wordIndex] &&
                      charIndex < userTyping[wordIndex].length
                        ? userTyping[wordIndex][charIndex] === char
                          ? "opacity-100" // if char is correct in word
                          : "opacity-100 text-red-200" // if not
                        : ""
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
                    <span className="opacity-100 text-red-200">
                      {userTyping[wordIndex].slice(word.length)}
                    </span>
                  )
              }
            </div>
          );
        })}
      </ul>
      <div
        className={`w-1 h-5 mt-1 bg-gray-200 rounded-xl animate-pulse absolute`}
        style={{
          left: caretPosition.x,
          top: caretPosition.y,
        }}
      ></div>
    </div>
  );
});

export default Lyrics;
