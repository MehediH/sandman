import Filter from "bad-words";

const filter = new Filter({ placeHolder: "" });

const lyricsToWords = (lyrics) => {
  return lyrics.replace("\n", "").replace(/\*/g, "").split(/\s+/);
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
  let lyrics = text.split(blockRegExp).filter((l) => l != "");
  let filteredLyrics = [];

  lyrics.map((block, index) => {
    const formatted = block
      .substring(block.indexOf("]") + 1, block.length)
      .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"']/g, "")
      .toLowerCase();

    if (formatted.length > 0) {
      lyrics[index] = { block: blocks[index], text: formatted };

      filteredLyrics.push({
        block: blocks[index],
        text: filter.clean(formatted),
      });
    }
  });
  return { lyrics, filteredLyrics };
};
