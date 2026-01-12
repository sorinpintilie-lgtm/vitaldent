import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);

const inputVideo = './public/the-office-of-the-dental-clinic-in-soothing-green-2025-12-17-13-19-56-utc.mp4';
const outputVideo = './public/optimized_video.mp4';

ffmpeg(inputVideo)
  .output(outputVideo)
  .videoCodec('libx264')
  .size('1280x?') // resize to 1280 width, keep aspect
  .videoBitrate('1000k') // lower bitrate
  .audioCodec('aac')
  .audioBitrate('128k')
  .on('end', () => {
    console.log('Video optimization complete');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .run();