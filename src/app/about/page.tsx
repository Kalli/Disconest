import '../style.css'
import 'bootstrap/dist/css/bootstrap.css'
import Image from 'next/image';

const About = () => {
    return (
        <div className="container jumbotron about">
            <a href="/">
                <Image
                    src="/img/disconest-1.png"
                    alt="Disconest Logo"
                    width={300}
                    height={50}
                    priority
                />
            </a>
            <div id="info" className="row">      
                <hr />
                    <div className="caption">Update: May 2016 - Some important changes to Disconest. <a href="#may2016">See below.</a></div>
                <hr />
                <p>
                    Disconest was borne out of an itch I had when comparing vinyl dj-ing to its digital counterpart. Of course proper djs should know their records but it can still be good to see at a glance whether this tune is 120 or 125 bpm or if it&apos;s in C or D major.
                </p>
            
                <p>
                    Ever so often you buy second hand records where dj&apos;s solved this problem in an ingenious fashion but tapping out the bpm&apos;s and writing labels doesn&apos;t really scale for hundreds or thousands of records.
                </p>
  
                <div className="image">
                    <Image
                        src="/img/disconest-1.jpg"
                        alt="How we used to do it"
                        width={600}
                        height={600}
                        priority
                    />
                    <div className="caption">Old skool bpm label on a 2nd hand record I bought. Useful information but tapping out bpms and writing them on covers really doesn&apos;t scale!</div>
                </div>
                
                <p>
                    I knew <a href="http://www.discogs.com/developers/">Discogs</a> had an api to get you information about the records listed on there and that Spotify (previously <a href="http://the.echonest.com/">The Echonest</a>) has metadata information on a lot of the songs on those records. So what Disconest does is connect the two. It doesn&apos;t always get it right, Spotify might not have information about that <a href="http://www.disconest.com/?discogsurl=https://www.discogs.com/release/1698948">super rare grime white label you bought in 2004</a>, but often enough it&apos;ll do the trick.
                </p>

                <Image
                        src="/img/disconest-2.jpg"
                        alt="How Disconest does it"
                        width={600}
                        height={600}
                        priority
                    />
                <div className="caption">
                    Disconest metadata label.
                </div>
                
                <p>
                    With Disconest you just look up your record on Discogs, <a href="http://www.disconest.com/?discogsurl=www.discogs.com/Larry-Heard-Alien/release/5603315">get the metadata</a> and print out the result.
                </p>
          
                <p>
                    There&apos;s also a <a href="http://www.github.com/kalli/disconest">command line version</a> that you can use to fetch the same information for your entire <a href="http://www.discogs.com/users/export?w=collection">Discogs</a> collection. I hope Disconest can be of use to some of the record nerds out there. Shouts to <a href="https://dribbble.com/jonfri">Jonfri</a> who made the snazzy logo.
                </p>
          
                <p>
                    Made by <a href="http://www.karltryggvason.com">Karl Tryggvason</a> (<a href="http://www.twitter.com/karltryggvason">@karltryggvason</a>) at <a href="http://www.london.musichackday.org/2013/">Music Hack Day London 2013</a>. Using: 
                    <a target="_blank" title="Echonest" href="http://the.echonest.com/">the Echonest</a> and <a target="_blank" title="Discogs" href="http://www.discogs.com/developers/">Discogs</a> apis.
                </p>
            <hr />
            <h2 id="may2016">
                Update: May 2016
            </h2>
            <p>
                As of May 29th 2016 Spotify is <a href="https://developer.spotify.com/news-stories/2016/03/29/audio-features-recommendations-user-taste/">winding down</a> the Echo Nest API. Spotify has introduced new services that handle similar information and Disconest has been transitioned to these new endpoints. However this means that the musical metadata on Disconest is now limited to releases that are in the Spotify catalogue. 
            </p>
            <p>
                If you have any ideas, run into problems or bugs let me know via <a href="mailto:ktryggvason@gmail.com">email</a>, <a href="http://twitter.com/karltryggvason">Twitter</a> or on <a href="https://github.com/kalli/disconest">Github</a>
            </p>
            <hr />
                <h2>Disconest in the press</h2>
            <p>
                Disconest has garnered the attention of some esteemed publications and web outlets. Check out links to some of the write ups below.
            </p>
            <ul>
                <li>
                    <a href="http://www.factmag.com/2016/03/21/disconest-records-bpm-check/">Fact Mag</a>
                </li>
                <li>
                    <a href="http://www.mixmag.net/read/disconest-gets-you-track-bpms-from-discogs-records-news">Mixmag</a>
                </li>    
                <li>
                    <a href="http://www.thevinylfactory.com/vinyl-factory-news/check-bpms-records-disco-nest/">The Vinyl Factory</a>
                </li>           
                <li>
                    <a href="http://onethingwell.org/post/141553241482/disconest">One Thing Well</a>
                </li>           
                <li>
                  <a href="http://www.stampthewax.com/2016/03/22/disconest/">Stamp the Wax</a>
                </li>           
                <li>
                    <a href="http://www.chartattack.com/news/2016/03/21/disconest-key-bpm-of-any-record/">Chart Attack</a>
                </li>
          </ul>
        </div>
      </div>
    )
}

export default About;