import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const LyricsPlaceholder = () => (
    <SkeletonTheme color="#976DF5" highlightColor="#A384F9">
        <p className="mt-20">
            <Skeleton count={10} duration={2} height={8} />
        </p>
    </SkeletonTheme>
)

export default LyricsPlaceholder;