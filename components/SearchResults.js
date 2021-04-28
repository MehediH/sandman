import { useRef, useEffect } from 'react';

const SearchResults = ({ results, hideResults, selectSong }) => {
    const resultsContainer = useRef(null);

    useEffect(() => {
        // add when mounted
        document.addEventListener("mousedown", handleClick);
        // return function to be called when unmounted
        return () => {
          document.removeEventListener("mousedown", handleClick);
        };
    }, []);
    
    const handleClick = e => {
        if (resultsContainer.current.contains(e.target)) {
            // inside click
            return;
        }
    
        hideResults();
    };

    return (
        <div ref={resultsContainer} className="bg-gray-200 p-5 rounded-lg shadow-xl my-5 text-black w-80 absolute transition-all z-50" >
          { results.map((result, index) => (
            <div
                key={result.id}
                tabIndex={index+2}
                onClick={() => {
                    selectSong(result);
                    hideResults();
                }}
                className="flex mb-3 focus:opacity-75 hover:opacity-75 cursor-pointer transition-all"
                onKeyDown={(e) => {
                    if(e.code === "Space" || e.code === "Enter"){
                        selectSong(result);
                        hideResults();
                    }
                }}
            >
              <img src={result.albumArt} width="50" height="50" alt={result.title} draggable="false" className="rounded-lg shadow-xl mr-3 self-start"/>
              <div className="flex flex-col">
                <h3>{result.title.split("by")[0]}</h3>
                <p className="opacity-60">by {result.title.split("by")[1].substr(1)}</p>
              </div>
            </div>
          )) }
        </div>
    )
}

export default SearchResults;