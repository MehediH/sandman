import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import LyricsPlaceholder from "./LyricsPlaceholder";

const SongPlaceholder = ({ vibrant, darkVibrant }) => (
  <SkeletonTheme color={darkVibrant} highlightColor={vibrant}>
    <div className="flex my-10">
      <div>
        <Skeleton width={320} height={320} />
        <p className="mt-7 flex justify-between">
          <Skeleton count={1} duration={2} height={30} width={200} />
          <Skeleton count={1} duration={2} height={30} width={40} />
        </p>
      </div>

      <div className="ml-10">
        <p>
          <Skeleton count={1} duration={2} height={10} width={130} />
        </p>
        <Skeleton count={1} duration={2} height={40} width={350} />

        <p className="mt-4">
          <Skeleton count={1} duration={2} height={10} width={170} />
        </p>

        <p className="flex items-center">
          <Skeleton count={1} duration={2} height={15} width={15} />
          <p className="mt-2 ml-2">
            <Skeleton count={1} duration={2} height={8} width={120} />
          </p>
        </p>

        <LyricsPlaceholder vibrant={vibrant} darkVibrant={darkVibrant} />
      </div>
    </div>
  </SkeletonTheme>
);

export default SongPlaceholder;
