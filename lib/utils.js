import Filter from 'bad-words';

const filter = new Filter({ placeHolder: ' '});

export const cleanLyrics = (text) => {
    const lyrics = text.replace(/\[.*?\]/g, '').replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"']/g,"").replace(/\s{2,}/g," ").toLowerCase();
    const filteredLyrics = filter.clean(lyrics);
    return { lyrics, filteredLyrics };
};
