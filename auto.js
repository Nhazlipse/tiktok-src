import { TiktokDL } from './lib/ttapi.js';
import { ReelsUpload } from './lib/browserHandler.js';
import axios from 'axios';
import ProgressBar from 'progress';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

const urlsFilePath = 'vt_url.txt';
const urls = fs.readFileSync(urlsFilePath, 'utf-8').trim().split('\n');

async function downloadAndUpload(url) {
  try {
    const result = await TiktokDL(url);
    if (result && result.status === "success" && result.result) {
      const video = result.result.video[0];
      const namafile = result.result.id;
      const caption = result.result.description;

      if (fs.existsSync(path.resolve('download', `${namafile}.mp4`))) {
        console.log(`[ ${chalk.hex('#f12711')(namafile)} Sudah Di Download! ] ===== [${chalk.hex('#7F7FD5')('skipped')}]`);
        return;
      } else {
        await axios({
          url: video,
          method: 'GET',
          responseType: 'stream'
        }).then(async ({ data, headers }) => {
          if (!fs.existsSync('download')) fs.mkdirSync('download');
          const totalLength = headers['content-length'];
          const progressBar = new ProgressBar(`[ ${chalk.hex('#ffff1c')("Proses Download")} ] [${chalk.hex('#6be585')(':bar')}] :percent downloaded in :elapseds`, {
            width: 40,
            complete: '<',
            incomplete: '•',
            renderThrottle: 1,
            total: parseInt(totalLength)
          });

          data.on('data', (chunk) => {
            progressBar.tick(chunk.length);
          });

          const writer = fs.createWriteStream(path.resolve('download', `${namafile}.mp4`));
          data.pipe(writer);

          data.on('end', async () => {
            await ReelsUpload(namafile, caption);
          });
        });
      }
    } else {
      console.log(`[ERROR] Failed to fetch TikTok data for URL: ${url}`);
    }
  } catch (err) {
    console.log(err);
  }
}

async function downloadAllVideosAndUpload() {
  for (const url of urls) {
    try {
      const result = await TiktokDL(url);
      if (result && result.status === "success" && result.result) {
        const namafile = result.result.id;

        if (fs.existsSync(path.resolve('download', `${namafile}.mp4`))) {
          console.log(`[ ${chalk.hex('#f12711')(namafile)} Sudah Di Download! ] ===== [${chalk.hex('#7F7FD5')('skipped')}]`);
          continue;
        } else {
          await downloadAndUpload(url);
        }

        await new Promise(resolve => setTimeout(resolve, 2700000));
      } else {
        console.log(`[ERROR] Failed to fetch TikTok data for URL: ${url}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

downloadAllVideosAndUpload();
