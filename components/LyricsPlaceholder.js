import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const LyricsPlaceholder = ({ vibrant, darkVibrant }) => (
  <SkeletonTheme color={darkVibrant} highlightColor={vibrant}>
    <p className="mt-4">
      <Skeleton count={1} duration={2} height={10} width={450} />
    </p>
    <p className="mt-2">
      <Skeleton count={10} duration={2} height={8} />
    </p>

    <p className="mt-4">
      <Skeleton count={1} duration={2} height={10} width={450} />
    </p>
    <p className="mt-2">
      <Skeleton count={10} duration={2} height={8} />
    </p>
  </SkeletonTheme>
);

export default LyricsPlaceholder;
