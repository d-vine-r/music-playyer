"use client";

import { SkipForward } from "lucide-react"
import { SkipBack } from "lucide-react"
import { Play } from "lucide-react"
import { clsx } from 'clsx';
import Volumer from '@/components/VolumeSlider'
import Slider from '@mui/material/Slider';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

interface Props {
  className?: string;
}

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

export const Player = ({className}: Props) => {
      const duration = 200; // seconds
      const [position, setPosition] = React.useState(32);
    function formatDuration(position: number): React.ReactNode {
        const minutes = Math.floor(position / 60);
        const seconds = Math.floor(position % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    return (
        <section className={clsx("bg-slate-100 rounded-t shadow justify-around sticky bottom-0 z-50 flex", className)}>
            <section className="flex-start align-left gap-4">
                <div className="flex-col items-left gap-4 p-4">
                    <h3>Nothing Yet</h3>
                    <p>Mr Thompson</p>
                </div>
            </section>
            <section>
                <div className="flex items-center justify-center gap-4 p-4">
                    <SkipBack />
                    <Play />
                    <SkipForward/>  
                </div>
                <Slider
                    aria-label="time-indicator"
                    size="small"
                    value={position}
                    min={0}
                    step={1}
                    max={duration}
                    onChange={(_, value) => setPosition(value)}
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
                        ...t.applyStyles('dark', {
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
                <div className="w-64 flex items-center justify-between p-4">
                    <Volumer/>

                </div>
            </section>
            

        </section>
    )
}

export default Player