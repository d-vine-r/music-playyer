"use client";

import { Repeat, Repeat1, Shuffle, ChevronUp, ChevronDown, SkipBack, SkipForward, Play, Pause } from "lucide-react"
import { clsx } from 'clsx';
import Volumer from '@/components/VolumeSlider'
import Slider from '@mui/material/Slider';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Image from "next/image";

interface Props {
  className?: string;
  audioUrl?: string;
  title?: string;
  artist?: string;
  audioImg?: any;
}

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});
const PlayButton = () => {
    const [play, setplay] = React.useState(false)
    return (
        <button
            aria-label="Toggle play"
            onClick={() => {
                setplay(p => !p);
            }}
            className={play ? "text-primary items-center justify-center" : "text-gray-500 items-center justify-center"}
        >
            {play ? <Play size={22} /> : <Pause size={22} />}
        </button>
    )
}

const RepeatButton = () => {
    const [repeat, setRepeat] = React.useState(false);
    return (
        <button
            aria-label="Toggle repeat"
            onClick={() => setRepeat(r => !r)}
            className={repeat ? "text-primary items-center justify-center" : "text-primary items-center justify-center"}
        >
            {repeat ? <Repeat1 size={22} /> : <Repeat size={22} />}
        </button>
    );
};

export const Player = ({className, audioUrl, title, artist, audioImg}: Props) => {
    const [play, setPlay] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [duration, setDuration] = React.useState(0);
    const [position, setPosition] = React.useState(0);

    React.useEffect(() => {
        if (audioUrl) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        }
        return () => {
            audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
            audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current = null;
        };
    }, [audioUrl]);

    React.useEffect(() => {
        if (play && audioRef.current) {
            audioRef.current.play();
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [play]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setPosition(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    function formatDuration(position: number): React.ReactNode {
        const minutes = Math.floor(position / 60);
        const seconds = Math.floor(position % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    return (
        <section className={clsx("bg-gradient-to-br from-purple-900 to-violet-800 rounded-t shadow justify-around w-screen sticky bottom-0 z-50 flex", className)}>
            <section className="flex-start flex align-left gap-4">
                <Image src={audioImg} width={100} height={40} alt="/placeholder.jpg"/>
                <div className="flex-col items-left text-white  gap-4 p-4">
                    <h3>{title || 'Nothing Yet'}</h3>
                    <p>{artist || 'Mr Thompson'}</p>
                </div>
            </section>
            <section>
                <div className="flex items-center justify-center gap-4 p-4">
                    <SkipBack className="hover:text-primary text-white" />
                    <button
                        aria-label={play ? "Pause" : "Play"}
                        onClick={() => setPlay(p => !p)}
                        className={play ? "text-primary" : "text-white"}
                    >
                        {play ? <Pause size={28} /> : <Play size={28} />}
                    </button>
                    <SkipForward className="hover:text-primary text-white"/>  
                </div>
                <Slider
                    aria-label="time-indicator"
                    size="medium"
                    value={position}
                    min={0}
                    step={1}
                    max={duration}
                    onChange={(_, value) => {
                        if (audioRef.current) {
                            audioRef.current.currentTime = value as number;
                        }
                        setPosition(value as number);
                    }}
                    sx={(t) => ({
                        color: 'rgba(0,0,0,0.87)',
                        height: 4,
                        '& .MuiSlider-thumb': {
                        width: 8,
                        height: 8,
                        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                        '&::before': {
                            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                        },
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px ${'rgb(0 0 0 / 16%)'}`,
                            ...t.applyStyles('dark', {
                            boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
                            }),
                        },
                        '&.Mui-active': {
                            width: 20,
                            height: 20,
                        },
                        },
                        '& .MuiSlider-rail': {
                        opacity: 0.28,
                        },
                        ...t.applyStyles('light', {
                        color: '#fff',
                        }),
                    })}
                />
                <Box
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: -2,
                    }}>
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>-{formatDuration(duration - position)}</TinyText>
        </Box>
            </section>
            <section>
                <div className="w-90 flex items-center justify-between gap-8 p-2">
                    <Volumer/>
                    <div className="justify-between items-center flex gap-4">
                        <RepeatButton/>
                        <Shuffle/>
                        <ChevronUp/>
                    </div>

                </div>
            </section>
        </section>
    )
}

export default Player