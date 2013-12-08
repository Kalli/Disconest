#!/usr/bin/python
# -*- coding: utf-8 -*-
from lxml import etree
import argparse
from pyechonest import song
from pyechonest import config
import sys 
import time 


class Disconest():
    def __init__(self, pathToReleaseXML, echonestapikey):
        print("---------------------------------")
        print("XML File: "+pathToReleaseXML)
        print("Echonest Api Key: "+echonestapikey)
        print("---------------------------------")
        config.ECHO_NEST_API_KEY=echonestapikey
        self.filepath = pathToReleaseXML
        self.apikey = echonestapikey
        self.parseReleases()


    def parseReleases(self):
        context = etree.iterparse(self.filepath, events=("start", "end"))
        context = iter(context)
        event, root = context.next()
        for event, elem in context:
            try: 
                if event == "end" and elem.tag == "release": 
                    if elem.find("tracklist") is not None:
                        for track in elem.find("tracklist"): 
                            discogsdata = self.parseRelease(elem, track)
                            audiosummary = self.getEchonestInformation(discogsdata)
                            if audiosummary:
                                self.saveEchonestMetadata(track,audiosummary)
            except ValueError, error:
                print error
                return False
        f = open(self.filepath.split(".xml")[0]+"-with-echonest-metadata.xml","w")
        f.write(etree.tostring(root ,pretty_print=True))
        f.close()


    def parseRelease(self, elem, track):
        artists = elem.find("artists")
        artistids = []
        artistnames = []
        if track.find("artists"):
            artists = track.find("artists")
        for artist in artists:
            artistids.append(artist.find("id").text)
            artistnames.append(artist.find("name").text)
        tracktitle = track.find("title").text
        return {"artistids":artistids, "artistnames":artistnames, "tracktitle": tracktitle}


    def getEchonestInformation(self, searchterms):
        audiosummary = {}
        try:
            time.sleep(0.5) # 120 api requests a minute if you upgrade your Echonest account
            discogssearch = song.search(artist_id="discogs:artist:"+searchterms["artistids"][0], title=searchterms["tracktitle"], buckets=["audio_summary"])
            print("Getting information for: "+str(searchterms))
            if discogssearch:
                audiosummary = discogssearch[0].get_audio_summary()
        except:
            e = sys.exc_info()[0]
            print("Got error for: "+str(searchterms))
            print(e)
        return audiosummary


    def saveEchonestMetadata(self, track, audiosummary):
        for key in audiosummary.keys():
            if key !="analysis_url":
                etree.SubElement(track, key).text = str(audiosummary[key])

description = '''
                This script fetches parses a Discogs Release XML file and fetches Echonest audio summary metadata for all the tracks in the collection.
        '''
argsparser = argparse.ArgumentParser(description=description)
argsparser.add_argument("-x", "--xmlfile", type=str, help="/full/path/to/discogs/data/dump/release.xml")
argsparser.add_argument("-e", "--echonestapikey",  type=str, help="An echonest api key")
args = argsparser.parse_args()
if args.xmlfile and args.echonestapikey:
    disconest = Disconest(args.xmlfile, args.echonestapikey)
else:
    print description