import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.css'
import './style.css'
import styles from "./page.module.css";

export default function Home() {
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
            <div className="col-md-6 col-md-offset-3" id="searchform">
              <div className="input-group">
                <input type="text" className="form-control" id="searchbox" placeholder="Search term or Discogs URL..." />
                <span className="input-group-btn">
                  <button className="btn btn-default" id="searchbutton" type="button">Go!</button>
                </span>
                <div id="results" className="dropdown">
                </div>
              </div>
            </div>
          </div>
      <div className="row loading ">
        <img className="center-block" src="/img/rekid.png" alt="Loading..." />
        <p className="text-center">Loading...</p>
      </div>
      <div className="row error">
        <h3 className="text-center">Sorry something went wrong. Please try again</h3>
      </div>
      <div id="release" className="row">
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
