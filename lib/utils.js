import Filter from "bad-words";

const filter = new Filter({ placeHolder: "" });

export const lyricsToWords = (lyrics) => {
  return lyrics
    .replace("\n", "")
    .replace(/\*/g, "")
    .split(/\s+/)
    .filter((l) => l != "");
};

export const cleanLyrics = (text) => {
  const lyrics = text
    .replace(/\[.*?\]/g, "")
    .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"']/g, "")
    .replace(/\s{2,}/g, " ")
    .toLowerCase();

  let filteredLyrics = filter.clean(lyrics);

  return {
    lyrics: lyricsToWords(lyrics).slice(0, 50),
    filteredLyrics: lyricsToWords(filteredLyrics).slice(0, 50),
  };
};

export const cleanLyricsIntoArray = (text) => {
  const blockRegExp = /\[.*?\]/g;
  const blocks = text.match(blockRegExp);

  let preLyrics = text.split(blockRegExp).filter((l) => l != "");
  let lyrics = [];
  let filteredLyrics = [];

  try {
    preLyrics.map((block, index) => {
      const formatted = block
        .substring(block.indexOf("]") + 1, block.length)
        .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"']/g, "")
        .toLowerCase();

      if (block.replace(/\W/g, "") !== "" && formatted.length > 0) {
        lyrics.push({ block: blocks[index], text: formatted });

        filteredLyrics.push({
          block: blocks[index],
          text: filter.clean(formatted),
        });
      }
    });

    return { lyrics, filteredLyrics, err: null };
  } catch (err) {
    return { err: err.message };
  }
};
