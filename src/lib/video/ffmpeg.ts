import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = "/tmp/ffmpeg_output";

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Extrait un segment d'une vidéo (pour Golden Moments)
 */
export async function extractSegment(
  inputPath: string,
  startTime: number,
  endTime: number
): Promise<string> {
  ensureOutputDir();
  const outputPath = path.join(OUTPUT_DIR, `segment_${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .outputOptions(["-c:v", "libx264", "-c:a", "aac"])
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Crop une vidéo au format 9:16 (vertical)
 */
export async function cropToVertical(inputPath: string): Promise<string> {
  ensureOutputDir();
  const outputPath = path.join(OUTPUT_DIR, `vertical_${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters("crop=ih*9/16:ih")
      .output(outputPath)
      .outputOptions(["-c:v", "libx264", "-c:a", "aac"])
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Ajoute des sous-titres à une vidéo à partir d'un fichier SRT
 */
export async function addSubtitles(
  inputPath: string,
  srtPath: string
): Promise<string> {
  ensureOutputDir();
  const outputPath = path.join(OUTPUT_DIR, `subtitled_${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(
        `subtitles=${srtPath.replace(/\\/g, "/")}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2'`
      )
      .output(outputPath)
      .outputOptions(["-c:v", "libx264", "-c:a", "aac"])
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Concatène plusieurs vidéos
 */
export async function concatenateVideos(
  inputPaths: string[]
): Promise<string> {
  ensureOutputDir();
  const outputPath = path.join(OUTPUT_DIR, `concat_${Date.now()}.mp4`);
  const listPath = path.join(OUTPUT_DIR, `concat_list_${Date.now()}.txt`);

  const fileList = inputPaths.map((p) => `file '${p}'`).join("\n");
  fs.writeFileSync(listPath, fileList);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .output(outputPath)
      .outputOptions(["-c", "copy"])
      .on("end", () => {
        fs.unlinkSync(listPath);
        resolve(outputPath);
      })
      .on("error", reject)
      .run();
  });
}
