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
  let lyrics = text.split(/\[.*?\]/g);
  let filteredLyrics = lyrics;
  lyrics.map((block, index) => {
    const cleaned = block
      .substring(block.indexOf("]") + 1, block.length)
      .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"']/g, "")
      .toLowerCase();
    if (cleaned.length < 0) {
      lyrics[index] = cleaned;
      filteredLyrics[index] = filter.clean(cleaned);
    }
  });
  return { lyrics, filteredLyrics };
};
