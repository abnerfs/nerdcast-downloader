const fetch = require('node-fetch');
const fs = require('fs');

const getLastTwo = () =>
    fetch('https://jovemnerd.com.br/wp-json/jovemnerd/v1/nerdcasts/?offset=0&page=1&per_page=2&paginated=true')
        .then(res => res.json())
        .then(res => res.data);

const download = async (url, dest) => {
    const bytes = await fetch(url)
        .then(res => res.buffer());

    fs.writeFileSync(dest, bytes);
}

const DOWNLOADED_PATH = './podcasts/downloaded.txt';

let downloadedArr = [];

if(fs.existsSync(DOWNLOADED_PATH)) {
    try{
        downloadedArr =  JSON.parse(fs.readFileSync(DOWNLOADED_PATH, 'utf8'));
    }
    catch(err) {

    }
}


(async () => {
    let fileDownloaded = false;
    const lastTwo = await getLastTwo();
    for(const podcast of lastTwo) {
        if(downloadedArr.includes(podcast.id))
            continue;

        const podcastName = `./podcasts/${podcast.product}_${podcast.episode}_${podcast.slug}.mp3`;
        await download(podcast.audio_high, podcastName);
        downloadedArr.push(podcast.id);
        fileDownloaded = true;
    }

    if(fileDownloaded)
        fs.writeFileSync(DOWNLOADED_PATH, JSON.stringify(downloadedArr), 'utf8');
})();