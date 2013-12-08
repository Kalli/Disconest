
# Disconest

Use the Echonest API to fetch information about tracks on Discogs releases. For dj's / record collectors who want musical/audio analysis metadata about their records and/or cds 

Fetch the information for a given record or your entire collection, use it to print out a one sheet with the relevant information.

Disconest uses the [The Echonest](http://the.echonest.com/) and [Discogs](http://www.discogs.com/developers/) apis to find this information about records and cds registered on Discogs. 

Disconest comes in two flavors: 

1. Web version  - Demo at [disconest.com](http://www.disconest.com)
  * Fetches and displays information about a single release at a time.
  
2. Command Line version
  * Fetches information from and saves information to an xml file
  * Can be used to fetch the data for your entire [Discogs collection](http://www.discogs.com/users/export?w=collection)
  * You can run this like so: 

  ```
  >cd CLI
  >pip install requirements.txt
  >python disconest.py -x "/full/path/to/discogs-collection.xml" -e "echonest api key"
  ```
  * be aware that this might take a while as Echonest must be queried for every song on every release.