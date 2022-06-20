import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { useState, useEffect, useCallback } from "react";
import { currentTrackIDState, isPlayingState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import useSongInfo from "../hooks/useSongInfo";
import { 
    HeartIcon,
    VolumeUpIcon as VolumeDownIcon
} from "@heroicons/react/outline";
import {
    FastForwardIcon,
    PauseIcon,
    PlayIcon,
    ReplyIcon,
    RewindIcon,
    VolumeUpIcon,
    SwitchHorizontalIcon
} from "@heroicons/react/solid";
import { debounce } from "lodash";

export default function Player() {

    const spotifyApi = useSpotify();
    const songInfo = useSongInfo();

    const { data: session, status } = useSession();

    const [currentTrackID, setCurrentTrackID] = useRecoilState(currentTrackIDState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50);

    function fetchCurrentSong() {

        if (!songInfo) {
            spotifyApi.getMyCurrentPlayingTrack()
            .then(data => {
                setCurrentTrackID(data.body?.item.id);

                spotifyApi.getMyCurrentPlaybackState()
                .then(data => {
                    setIsPlaying(data.body?.is_playing);
                });
            });
        };

    };

    function handlePlayback() {

        spotifyApi.getMyCurrentPlaybackState()
        .then(data => {
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        });

    };

    useEffect(() => {

        if (spotifyApi.getAccessToken() && !currentTrackID) {
            fetchCurrentSong();
            setVolume(50);
        };

    }, [currentTrackID, spotifyApi, session]);

    useEffect(() => {

        if (volume > 0 && volume < 100) {
            debouncedAdjustVolume(volume);
        }

    },[volume]);

    const debouncedAdjustVolume = useCallback(
        debounce((volume) => {
            spotifyApi.setVolume(volume)
            .catch((err) => {});
        }, 500),
        []
    );

    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">

            {/* Left */}
            <div className="flex items-center space-x-4">
                <img
                    className="hidden md:inline h-1- w-10"
                    src={songInfo?.album.images?.[0]?.url}
                    alt=""
                />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>

            {/* Center */}
            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="button"/>
                <RewindIcon
                    onClick={() => spotifyApi.skipToPrevious()}
                    className="button"
                />

                {isPlaying ? (
                    <PauseIcon
                        onClick={handlePlayback}
                        className="button w-10 h-10"
                    />
                ) : (
                    <PlayIcon
                        onClick={handlePlayback}
                        className="button w-10 h-10"
                    />
                )}

                <FastForwardIcon
                    onClick={() => spotifyApi.skipToNext()}
                    className="button"
                />
                <ReplyIcon className="button"/>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
                <VolumeDownIcon 
                    className="button"
                    onClick={() => volume > 0 && setVolume(volume - 10)}
                />
                <input 
                    className="w-14 md:w-28" 
                    type="range"
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    min={0} 
                    max={100}
                />
                <VolumeUpIcon
                    className="button"
                    onClick={() => volume < 100 && setVolume(volume + 10)}
                />
            </div>
        </div>
    );

};