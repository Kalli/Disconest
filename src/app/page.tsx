'use client'
import Image from "next/image";
import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.css'
import './style.css'
import './print.css'
import React, { useState, useEffect } from 'react';
import { DiscogsReleaseProps, DiscogsRelease, createArtistDisplayName } from './release';
import { AlbumWithAudioFeatures } from './types/spotify';
import { useRouter, useSearchParams } from 'next/navigation';
import { Banner } from "./links";

type ReleaseType = "master" | "release";

export default function Home() {
    const router = useRouter()

    const [selectedReleaseId, setselectedReleaseId] = useState<number | null>(null);
    const [selectedReleaseType, setselectedReleaseType] = useState<ReleaseType | null>(null);
    const [selectedRelease, setselectedRelease] = useState<DiscogsReleaseProps | null>(null);
    const [spotifyData, setSpotifyData] = useState<AlbumWithAudioFeatures | null>(null);
    const [loadingDiscogsData, setLoadingDiscogsData] = useState<boolean>(false);
    const [banner, setBanner] = useState<React.ReactNode|null>(null);
    const [errored, setError] = useState<boolean>(false);
    
    const handleReleaseSelected = (releaseId: number|null, releaseType: ReleaseType|null) => {
        setselectedReleaseId(releaseId);
        setselectedReleaseType(releaseType);
        const banner = <Banner />;
        setBanner(banner)
    };

    // first load of a page with id in the url, then set the selected release id and type
    const queryParams = useSearchParams();
    const urlReleaseType = queryParams?.get('type');
    const urlReleaseId = queryParams?.get('id');
    if (urlReleaseType && urlReleaseId && selectedReleaseId === null){
        setselectedReleaseId(parseInt(urlReleaseId));
        setselectedReleaseType(urlReleaseType as ReleaseType);
    }

    const discogsurl = queryParams?.get('discogsurl');
    // if this page was loaded by the bookmarklet we will have gotten the discogsurl param 
    if (discogsurl && selectedReleaseId === null){
        const url = new URL(discogsurl);
        const pathnameParts = url.pathname.split('/');
        const releaseType = pathnameParts[pathnameParts.length - 2];
        const releaseId = pathnameParts[pathnameParts.length - 1].split('-')[0];

        setselectedReleaseId(parseInt(releaseId));
        setselectedReleaseType(releaseType as ReleaseType);
    }

    const updateUrl = () => {
        if (selectedRelease !== null && selectedRelease.title !== undefined && selectedRelease.artists !== undefined) {
            document.title = `Musical metadata for ${selectedRelease.title} by ${createArtistDisplayName(selectedRelease.artists)} - Disconest`;
        };
        router.push(`/?type=${selectedReleaseType}&id=${selectedReleaseId}`);
    }

    useEffect(() => {
        const loadDiscogsRelease = async () => {
            if (selectedReleaseId !== null){
                setselectedRelease(null);
                setLoadingDiscogsData(true);
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
                    setLoadingDiscogsData(false);
                } catch (error) {
                    console.error('There was an error!', error);
                    setError(true);
                }
            }
        };
        loadDiscogsRelease();
    }, [selectedReleaseId, selectedReleaseType]);

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
                    const spotifyData = data as AlbumWithAudioFeatures;
                    setSpotifyData(spotifyData)
                } catch (error) {
                    console.error('There was an error!', error);
                }
            }
        };
        if (selectedRelease !== null){
            updateUrl();
            loadSpotifyData();
        }
    }, [selectedRelease]);
    return (
        <main>
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
                        Keys, bpm&apos;s and more.</p>
                    </div>
                    <div className="row">
                        <SearchForm handleReleaseSelected={handleReleaseSelected} setLoadingDiscogsData={setLoadingDiscogsData}></SearchForm>
                    </div>
            {loadingDiscogsData && <Loading />}
            {errored && <ErrorMessage />}
            <div id="release" className="row">
                {selectedRelease?
                    (<DiscogsRelease discogsRelease={selectedRelease} spotifyData={spotifyData} />): null
                }
            </div>
            {selectedRelease? banner : null}
            <div id="info" className="row">            
                <p>
                    Vinyl sounds better, looks better, feels better and even smells better. But digital does have its benefits, musical metadata is one of them. Having the <em>key</em>, <em>tempo</em> and other musical metadata for your records at a glance would be useful! Disconest uses <a target="_blank" href="http://the.echonest.com/">The Echonest</a> music database to find this information about records and cds registered on <a target="_blank" href="http://www.discogs.com">Discogs</a>. 
                </p>    
                <p>    
                    Enter a search term or a Discogs url in the box above to try it out or drag this 
                    <span className="badge bookmarklet" dangerouslySetInnerHTML={{__html:'<a href="javascript:(function(){var matches,regexp,url;url=document.URL;regexp=/(?:https?:\\/\\/)?(?:www.)?discogs.com\\/.*?\\/?(release|master)\\/(\\d+)/;matches=url.match(regexp);if(matches&&matches.length===3){open(\'http://www.disconest.com/?discogsurl=\'+url,\'_blank\',\'resizable,location,menubar,toolbar,scrollbars,status\');}else{alert(&quot;This is not a valid Discogs url&quot;);}})();">Disconest!</a>'}} />
                    bookmarklet to your bookmarks bar and click it when you are on a Discogs release page. <Link href="/about">More information.</Link>
                </p>
            </div>
            <div id="printinfo" className="row">
                <p>Disconest.com - Musical Metadata for your Records</p>
            </div>
            </div>
            </div>
        </main>
    );
}

interface SearchFormProps {
    handleReleaseSelected: (releaseId: number|null, releaseType: ReleaseType|null) => void;
    setLoadingDiscogsData: (loading: boolean) => void;
}

const Loading : React.FC = () => {
    return (
        <div className="row loading ">
            <Image className="center-block" src="/img/rekid.png" alt="Loading..." width={48} height={48} />
            <p className="text-center">Loading...</p>
        </div>
    )
}

const ErrorMessage : React.FC = () => {
    return (
        <div className="row error">
            <h3 className="text-center">Sorry something went wrong. Please refresh the page and try again</h3>
        </div>
    )
}


const SearchForm : React.FC<SearchFormProps> = ({ handleReleaseSelected, setLoadingDiscogsData }) =>  {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResultProps["results"]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            discogsSearch();
        }
        if (e.key === 'Escape') {
            setSearchResults([]);
        }
      };
    
    const discogsSearch = async () => {
        try {
            setLoadingDiscogsData(true);
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
            setLoadingDiscogsData(false);
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

    const closeSearch = (e: React.MouseEvent) => {
        e.preventDefault();
        setSearchResults([]);
    }


    const showResults = results.slice(0, resultsToShow);
    const showMore = (<>
        <li className="divider"></li>
        <li>
        {results.length > resultsToShow ? <button className="btn btn-default pull-left" onClick={showAllClickHandler}>Show more</button> : null}
        <button className="btn btn-default pull-right" onClick={closeSearch}>Close</button>
        </li>
    </>);

    return (
        <div id="results" className="dropdown">
            <ul id="searchCollection" className="col-md-12 dropdown-menu" role="menu" tabIndex={1} aria-labelledby="searchform">
                {showResults.slice().map(release => {
                    return (
                        <li key={release.id}>
                            <a href="" onClick={(e) => releaseClickHandler(e, release.id, release.type)}>
                                <Image width="50" height="50" src={release.thumb} alt={release.title + " cover"}/>
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