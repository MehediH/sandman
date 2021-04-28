import Filter from 'bad-words';

const filter = new Filter({ placeHolder: ' '});

export const cleanLyrics = (text) => {
    // remove punctuation
    const lyrics = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g,'').replace(/\[.*?\]/g, '').toLowerCase();

    const filteredLyrics = filter.clean(lyrics);

    return { lyrics, filteredLyrics };
};
