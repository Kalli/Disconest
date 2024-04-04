import React, { useState, useRef } from 'react';

type BPMCounterProps = {
    originalBpm: number,
    setBpm: (bpm: number) => void,
}

export const BPMCounter : React.FC<BPMCounterProps> = (props) => {
    const [tapCounts, setTapCounts] = useState<number>(0);
    const [tapStart, setTapStart] = useState<Date|null>(null);
    const [BPM, setBPM] = useState<number|null>(null);
    const tapEndRef = useRef<Date|null>(null);
    const tapIntervalIdRef = useRef<number|null>(null);

    const multiply = (multiplier:number, event: React.MouseEvent) => {
        event.stopPropagation();
        setBPM((BPM || props.originalBpm) * multiplier);
        props.setBpm((BPM || props.originalBpm) * multiplier);
    }

    const tapBpms = (event: React.MouseEvent) => {
        event.stopPropagation();
        setTapCounts(tapCounts + 1);
        if (!tapStart){
            setTapStart(new Date());
            tapEndRef.current = null;
            tapIntervalIdRef.current = null;
        } else {
            const bpm = tapCounts * 1000 / ((new Date).getTime() - tapStart.getTime()) * 60;
            tapEndRef.current = new Date();
            setBPM(bpm);
            props.setBpm(bpm);
        }
        if (!tapIntervalIdRef.current){
            tapIntervalIdRef.current = Number(setInterval(() => {
                resetBpmTap(tapEndRef, tapIntervalIdRef);
            }, 2000));
        }
    }

    const resetBpmTap = (tapEndRef: React.RefObject<Date> | null, tapIntervalId: React.RefObject<number> | null,) => {
        if (tapEndRef?.current && new Date().getTime() - tapEndRef?.current.getTime() > 2000){
            setTapCounts(0);
            setTapStart(null);
            if (tapIntervalId?.current){
                clearInterval(tapIntervalId.current);
            }
        }
    }
    return (
        <div className='bpm-tool popover top'>
            <div className="arrow" style={{"left": "50%"}}></div>
            <div className="btn-group center">
                <button className="btn btn-default btn-sm" onClick={(e) => multiply(2, e)} title='Double current bpm'>2×</button>
                <button className="btn btn-default btn-sm" onClick={(e) => multiply(0.5, e)} title='Half current bpm'>½×</button>
                <button className="btn btn-default btn-sm" onClick={(e) => tapBpms(e)} title='Tap bpm by using your mouse (resets after 2 seconds of inactivity)'>Tap</button>
            </div>
        </div>
    )
}