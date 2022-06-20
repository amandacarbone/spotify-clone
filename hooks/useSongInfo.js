import { useRecoilState, useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { currentTrackIDState } from "../atoms/songAtom";
import { playlistIDState } from "../atoms/playlistAtom";
import useSpotify from "./useSpotify";

export default function useSongInfo() {

    const spotifyApi = useSpotify();
    const [currentTrackID, setCurrentTrackID] = useRecoilState(currentTrackIDState);
    const [songInfo, setSongInfo] = useState(null);
    const playlistID = useRecoilValue(playlistIDState);

    useEffect(() => {

        async function fetchSongInfo() {
            if (currentTrackID) {
                const trackInfo = await fetch(
                    `https://api.spotify.com/v1/tracks/${currentTrackID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyApi.getAccessToken()}`
                        }
                    }
                ).then(res => res.json());

                setSongInfo(trackInfo);
            }
        };

        fetchSongInfo();

    }, [currentTrackID, spotifyApi])

    return songInfo;

};