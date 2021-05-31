import Filter from "bad-words";

const filter = new Filter({ placeHolder: "" });

export const lyricsToWords = (lyrics) => {
  return lyrics
    .replace("\n", "")
    .replace(/\*/g, "")
    .split(/\s+/)
    .filter((l) => l != "");
};

// given a set of lyrics, splits up long blocks
// into multiple parts
const splitBlocksIntoChunks = (lyrics, blockTitles) => {
  const originalBlockTitles = [...blockTitles];
  const originalLyrics = [...lyrics];

  let lastChunks = 0;

  for (let i = 0; i < originalLyrics.length; i++) {
    const block = originalLyrics[i];

    const newLines = [...block.matchAll(/\n/g)]
      .map((i) => i.index)
      .filter((i) => i !== 0);

    // we only split a block into chunks if there are more than 15 lines
    if (newLines.length <= 15) continue;

    const chunks = block.split("\n");

    const newChunks = [];
    const newBlockTitles = [];
    let chunkNum = 1;

    while (chunks.length) {
      newChunks.push(chunks.splice(0, 15).join("\n "));
      newBlockTitles.push(`${originalBlockTitles[i]} [Part ${chunkNum}]`);
      chunkNum += 1;
    }

    lyrics.splice(i + lastChunks, 1, ...newChunks);
    blockTitles.splice(i + lastChunks, 1, ...newBlockTitles);

    lastChunks = newChunks.length - 1;
  }

  return { lyrics, blockTitles };
};

export const cleanLyricsIntoArray = (text) => {
  const blockRegExp = /\[.*?\]/g;
  const blocks = text.match(blockRegExp);

  let preLyrics = text.split(blockRegExp).filter((l) => l != "");
  let lyrics = [];
  let filteredLyrics = [];

  // compress long lyric blocks into smaller chunks/parts
  let { lyrics: compressedLyrics, blockTitles } = splitBlocksIntoChunks(
    preLyrics,
    blocks
  );

  try {
    compressedLyrics.map((block, index) => {
      const formatted = block
        .substring(block.indexOf("]") + 1, block.length)
        .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"'’]/g, "")
        .toLowerCase();

      if (block.replace(/\W/g, "") !== "" && formatted.length > 0) {
        lyrics.push({ block: blockTitles[index], text: formatted });

        filteredLyrics.push({
          block: blockTitles[index],
          text: filter.clean(formatted),
        });
      }
    });

    return { lyrics, filteredLyrics, err: null };
  } catch (err) {
    return { err: err.message };
  }
};
