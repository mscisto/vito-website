# Vito Di Archangel’s portfolio

Hello Vito this is Mateo. Here is your readme with instructions.

## Open the website

Click on the index.html to have it open up your website. Move around to see if you like it. As for the PDF it is linked in the assets folder.

## Music and portrait

The bottom music button plays the Juventus theme, copied to
`assets/background-music.mp3`. The site attempts autoplay at 5% volume, loops the
track, and offers Play music if the browser blocks audible autoplay. Visitors can
pause or adjust volume at any time. 



## Continuous music between pages

Internal links replace the header, main content and footer while preserving the
original music dock and audio element. Playback position, volume and pause state
therefore remain unchanged during navigation. Browser Back and Forward work too.
HTTP previews use normal page URLs; opening from the Desktop uses hash routes.
Each project HTML file still works as a direct entry point.

`page-data.js` contains the navigation fragments from the standalone HTML pages.
After editing page content, run `node sync-pages.cjs` to refresh these fragments. Shared behaviour is in `script.js`; do not reinitialise the music during
page navigation. Refreshing the browser or opening a new tab creates a new player.
