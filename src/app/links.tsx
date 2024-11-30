import React, { useState } from 'react';
import { DiscogsLabel, DiscogsArtist, createArtistDisplayName } from './release';
import Image from "next/image";

interface LinksProps {
    labels: DiscogsLabel[];
    artists: DiscogsArtist[];
}

export const Links: React.FC<LinksProps> = ({ labels, artists }) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    let searchprefix = 'http://www.juno.co.uk/search/?q';
    const labelLinks = labels? labels.map((label) => {
        const labelLink = searchprefix + "%5Blabel%5D%5B%5D=" + encodeURIComponent(label.name) + '&ref=bbis';
        return <a key={label.name} target="_blank" href={labelLink}>Releases on {label.name}</a>;
    }) : [];
    const artistName = createArtistDisplayName(artists);
    const junoLink = searchprefix + "%5Bartist%5D%5B%5D=" + encodeURIComponent(artistName) + '&ref=bbis';
    const artistLinks = artists.map((artist) => {
        return <a target="_blank" key={artist.name} href={junoLink}>Releases by {artist.name}</a>;

    });
    return (
        <div className="social release col-md-12">
            <a id="print" onClick={() => window.print()} type="button" className="btn pr btn-default">
                <span className="print icon-printer"> </span>
                Print one sheet
            </a>
            <div className="jn btn-group">
                <a href={junoLink} target="_blank" className="btn juno">
                    <span className="icon-radio-checked2"></span>
                    &nbsp;Buy records on Juno
                </a>
                <button 
                    type="button" className="btn juno" 
                    aria-expanded={isVisible} onClick={toggleVisibility}
                >
                    <span className="caret"></span>
                    <span className="sr-only">Toggle Dropdown</span>
                </button>
                {isVisible && (
                    <ul className="junolinks">
                        {artistLinks? <li key={'artist'}>{artistLinks}</li> : null}
                        {labelLinks? <li key={'label'}>{labelLinks}</li> : null}
                    </ul>
                )}
            </div>
            <a className="btn tw btn-info" href="http://twitter.com/intent/tweet?hashtags=Disconest&url=http%3A//www.disconest.com/%3Fdiscogsurl%3Dhttp%253A//www.discogs.com/<%= type %>/<%= id %>" target="_blank">
                <span className="icon-twitter2"></span>
                &nbsp;Tweet
            </a>
            <a className="btn fb btn-primary" href="https://www.facebook.com/sharer/sharer.php?u=http://www.disconest.com/?discogsurl=http://www.discogs.com/<%= type %>/<%= id %>" target="_blank">
                <span id="fb" className="icon-facebook2"> </span>
                &nbsp;Share on Facebook
            </a>
        </div>
    );
}

export const Banner: React.FC = () => {
    const banners = [
        { 
            src: 'https://images.juno.co.uk/banners/affiliate/latestcampaign/jr_latestcampaign_468x60.gif',
            href: 'http://www.juno.co.uk/latestcampaign/?ref=bbis',
            alt: 'Juno Records latest campaign', 
        },
        {
            src: 'https://affiliate.juno.co.uk/accounts/default1/banners/0e2eb320.gif',
            href: 'http://www.juno.co.uk/promotions/Studio_Equipment_Deals/?ref=bbis',
            alt: 'Studio Equipment Deals',        
        },
        {
            src: 'https://affiliate.juno.co.uk/accounts/default1/banners/d23486eb.gif',
            href: 'http://www.juno.co.uk/promotions/DJ_Equipment_Deals/?ref=bbis',
            alt: 'DJ Equipment Deals',        
        },
    ]
    const banner = banners[Math.floor(Math.random() * banners.length)];
    return (<></>)
    // return (<div className="row banner">
    //     <div className="text-center" >
    //         <a href={banner.href} target="_blank">
    //             <Image src={banner.src} alt={banner.alt} width={468} height={60} style={{display: 'inline-block', verticalAlign: 'middle'}} className='center text-center'/>
    //         </a>
    //     </div>
    //     <div className="text-center" >
    //         <a href={banner.href} target="_blank">
    //             <small>Support Disconest by shopping from Juno</small>
    //         </a>
    //     </div>
    // </div>)
}