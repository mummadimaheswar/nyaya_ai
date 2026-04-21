import { Router, type IRouter } from "express";
import { TranscribeAudioBody } from "@workspace/api-zod";
import { transcribeAudioBuffer } from "../lib/legalAi";

const router: IRouter = Router();

router.post("/analysis/transcribe", async (req, res) => {
  const body = TranscribeAudioBody.parse(req.body);
  const buffer = Buffer.from(body.audio_base64, "base64");
  const result = await transcribeAudioBuffer({
    buffer,
    mimeType: body.mime_type,
    language: body.language,
  });
  res.json(result);
});

export default router;
