import Filter from 'bad-words';

const cleanLyrics = (text) => {
    // remove punctuation
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g,'').replace(/\[.*?\]/g, '').toLowerCase();
    
    const filter = new Filter({ placeHolder: ' '});

    return filter.clean(text);
};

module.exports = {
    cleanLyrics
}