'use client'
import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.css'
import './style.css'
import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import { DiscogsReleaseProps, DiscogsRelease, createArtistDisplayName } from './release';
import { AlbumWithAudioFeatures } from './types/spotify';
type ReleaseType = "master" | "release";

export default function Home() {
    const [selectedReleaseId, setselectedReleaseId] = useState<number | null>(null);
    const [selectedReleaseType, setselectedReleaseType] = useState<ReleaseType | null>(null);
    const [selectedRelease, setselectedRelease] = useState<DiscogsReleaseProps | null>(null);
    
    const handleReleaseSelected = (releaseId: number|null, releaseType: ReleaseType|null) => {
        setselectedReleaseId(releaseId);
        setselectedReleaseType(releaseType);
    };

    useEffect(() => {
        const loadDiscogsRelease = async () => {
            if (selectedReleaseId !== null){
                try {
                    const response = await fetch(`/api/discogs?${selectedReleaseType}=${selectedReleaseId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setselectedRelease(data);
                } catch (error) {
                    console.error('There was an error!', error);
                }
            }
        };
        loadDiscogsRelease();
    }, [selectedReleaseId]);

    useEffect(() => {
        const loadSpotifyData = async () => {
            if (selectedRelease !== null){
                try {
                    const query = (
                        `title=${encodeURIComponent(selectedRelease.title)}&` + 
                        `artist=${encodeURIComponent(createArtistDisplayName(selectedRelease.artists))}`
                    );
                    const response = await fetch(`/api/spotify?${query}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    // @ts-ignore
                    const spotifyData = data as AlbumWithAudioFeatures;
                    setselectedRelease({
                        ...selectedRelease,
                        spotify: spotifyData
                    })
                } catch (error) {
                    console.error('There was an error!', error);
                }
            }
        };
        loadSpotifyData();
    }, [selectedRelease]);
    return (
        <main className={styles.main}>
            <div className="container">
                <div className="jumbotron">
                    <div className="form-disconest">
                        <a href="/">
                            <Image
                                src="/img/disconest-1.png"
                                alt="Disconest Logo"
                                width={300}
                                height={50}
                                priority
                            />
                        </a>
                        <p>Find musical metadata for your records!<br />
                        Keys, bpm's and more.</p>
                    </div>
                    <div className="row">
                        <SearchForm handleReleaseSelected={handleReleaseSelected} ></SearchForm>
                    </div>
            <div className="row loading ">
                <img className="center-block" src="/img/rekid.png" alt="Loading..." />
                <p className="text-center">Loading...</p>
            </div>
            <div className="row error">
                <h3 className="text-center">Sorry something went wrong. Please try again</h3>
            </div>
            <div id="release" className="row">
                {selectedRelease && <DiscogsRelease {...selectedRelease} />}
            </div>
            <div id="info" className="row">            
                <p>
                    Vinyl sounds better, looks better, feels better and even smells better. But digital does have its benefits, musical metadata is one of them. Having the <em>key</em>, <em>tempo</em> and other musical metadata for your records at a glance would be useful! Disconest uses <a target="_blank" href="http://the.echonest.com/">The Echonest</a> music database to find this information about records and cds registered on <a target="_blank" href="http://www.discogs.com/developers/">Discogs</a>. 
                </p>    
                <p>    
                    Enter a search term or a Discogs url in the box above to try it out or drag this <span className="badge">
                        <a href="javascript:(function(){var matches,regexp,url;url=document.URL;regexp=/(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)\/(\d+)/;matches=url.match(regexp);if(matches&&matches.length===3){open('http://www.disconest.com/?discogsurl='+url,'_blank','resizable,location,menubar,toolbar,scrollbars,status');}else{alert(&quot;This is not a valid Discogs url&quot;);}})();">Disconest!</a></span> bookmarklet to your bookmarks bar and click it when you are on a Discogs release page. <a href="/about">More information.</a>
                </p>
            </div>
            <div id="printinfo" className="row">
                <p>Disconest.com - Musical metadata for your Records</p>
            </div>
            </div>
            </div>
        </main>
    );
}

interface SearchFormProps {
    handleReleaseSelected: (releaseId: number|null, releaseType: ReleaseType|null) => void;
}


const SearchForm : React.FC<SearchFormProps> = ({ handleReleaseSelected }) =>  {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResultProps["results"]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            discogsSearch();
        }
      };
    
    const discogsSearch = async () => {
        try {
            const response = await fetch(`/api/discogs?q=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error('There was an error!', error);
        }
    };

    return (
        <div className="col-md-6 col-md-offset-3" id="searchform">
            <div className="input-group">
                <input 
                    type="text"
                    className="form-control"
                    id="searchbox"
                    value={searchQuery}
                    onChange={handleInputChange}    
                    onKeyDown={handleKeyDown}    
                    placeholder="Search term or Discogs URL..." 
                />
                <span className="input-group-btn">
                    <button className="btn btn-default" id="searchbutton" type="button" onClick={discogsSearch}>Go!</button>
                </span>
                <SearchResults results={searchResults} onSelectRelease={handleReleaseSelected} setSearchResults={setSearchResults} /> 
            </div>
        </div>
    );
}

interface SearchResultProps {
    results?: DiscogsSearchResult[];
    setSearchResults: (results: DiscogsSearchResult[]) => void,
    onSelectRelease: (releaseId: number, releaseType: ReleaseType) => void,
}

interface DiscogsSearchResult{
    thumb: string,
    title: string,
    id: number,
    type: ReleaseType,
}

const SearchResults: React.FC<SearchResultProps> = ({ results = [], onSelectRelease, setSearchResults }) => {
    const [resultsToShow, setResultsToShow] = useState<number>(4);
    if (results?.length === 0){
        return null;
    }

    const showAllClickHandler = (e: React.MouseEvent) => {
        e.preventDefault();
        setResultsToShow(resultsToShow + 4)
    }

    const releaseClickHandler = (e: React.MouseEvent, releaseId: number, releaseType: ReleaseType) => {
        e.preventDefault();
        setSearchResults([]);
        onSelectRelease(releaseId, releaseType);
    }
    const showResults = results.slice(0, resultsToShow);
    const showMore = results.length > resultsToShow ? (
        <><li className="divider"></li><li><a className="showmore" href="" onClick={showAllClickHandler}>Show more</a></li></>
    ) : null;

    return (
        <div id="results" className="dropdown">
            <ul id="searchCollection" className="col-md-12 dropdown-menu" role="menu" tabIndex={1} aria-labelledby="searchform">
                {showResults.slice().map(release => {
                    return (
                        <li key={release.id}>
                            <a href="" onClick={(e) => releaseClickHandler(e, release.id, release.type)}>
                                <img width="50" height="50" src={release.thumb} />
                                {release.title}
                            </a>
                        </li>
                    )
                })}
                {showMore}
            </ul>
        </div>
    )
}