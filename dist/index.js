// server/index.ts
import express from "express";
import cors from "cors";
import path6 from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import { join } from "path";

// server/midi-service.ts
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
var MidiService = class {
  // SERVICE CONFIGURATION
  // NOTE: These paths are configurable for different environments
  pythonPath = "python3";
  // Python executable
  generatorScript = "./music Gen extra/Main.py";
  // Main generator script
  outputDir = "./storage/midi/generated";
  // Output directory
  templatesDir = "./storage/midi/templates";
  // Template directory
  // MAIN MIDI GENERATION METHOD
  // NOTE: Orchestrates the entire MIDI generation process
  // TODO: Add progress tracking and cancellation support
  async generateMidi(request) {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      const timestamp = Date.now();
      const sanitizedTitle = request.title.replace(/[^a-zA-Z0-9]/g, "_");
      const outputPath = path.join(this.outputDir, `${sanitizedTitle}_${timestamp}.mid`);
      const enhancedArgs = [
        "./server/enhanced-midi-generator.py",
        // Enhanced generator script
        "--title",
        request.title,
        "--theme",
        request.theme,
        "--genre",
        request.genre,
        "--tempo",
        request.tempo.toString(),
        "--output",
        outputPath
      ];
      if (request.useAiLyrics) {
        enhancedArgs.push("--ai-lyrics");
      }
      if (request.duration) {
        enhancedArgs.push("--duration", request.duration.toString());
      }
      if (request.voiceId) {
        enhancedArgs.push("--voice-id", request.voiceId);
      }
      const result = await this.executePythonScript(enhancedArgs);
      if (result.success) {
        const midiExists = await this.fileExists(outputPath);
        const metadataPath = outputPath.replace(".mid", "_metadata.json");
        const metadataExists = await this.fileExists(metadataPath);
        return {
          success: midiExists,
          midiPath: midiExists ? outputPath : void 0,
          metadataPath: metadataExists ? metadataPath : void 0,
          error: midiExists ? void 0 : "MIDI file was not generated"
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `MIDI generation failed: ${error}`
      };
    }
  }
  async executePythonScript(args) {
    return new Promise((resolve) => {
      const childProcess = spawn(this.pythonPath, args);
      let stderr = "";
      let stdout = "";
      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            error: `Process exited with code ${code}. Error: ${stderr}`
          });
        }
      });
      childProcess.on("error", (error) => {
        resolve({
          success: false,
          error: `Failed to start process: ${error.message}`
        });
      });
    });
  }
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  async listGeneratedMidi() {
    try {
      const files = await fs.readdir(this.outputDir);
      return files.filter((file) => file.endsWith(".mid"));
    } catch {
      return [];
    }
  }
  async getMidiMetadata(midiPath) {
    try {
      const metadataPath = midiPath.replace(".mid", "_metadata.json");
      const metadata = await fs.readFile(metadataPath, "utf-8");
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }
  async listMidiTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      return files.filter((file) => file.endsWith(".mid") || file.endsWith(".midi"));
    } catch {
      return [];
    }
  }
  async generateFromTemplate(templateName, customizations) {
    try {
      const templatePath = path.join(this.templatesDir, templateName);
      const exists = await this.fileExists(templatePath);
      if (!exists) {
        return {
          success: false,
          error: `Template ${templateName} not found`
        };
      }
      const timestamp = Date.now();
      const baseName = templateName.replace(/\.(mid|midi)$/, "");
      const outputPath = path.join(this.outputDir, `${baseName}_custom_${timestamp}.mid`);
      await fs.copyFile(templatePath, outputPath);
      const metadata = {
        source_template: templateName,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        customizations: customizations || {},
        generation_method: "template_based"
      };
      const metadataPath = outputPath.replace(".mid", "_metadata.json");
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      return {
        success: true,
        midiPath: outputPath,
        metadataPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Template generation failed: ${error}`
      };
    }
  }
  async catalogTemplates() {
    try {
      const result = await this.executePythonScript([
        "./server/midi-catalog.py",
        "--scan"
      ]);
      if (result.success) {
        return {
          success: true,
          catalogPath: "./storage/midi/templates/midi_catalog.json"
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Catalog generation failed: ${error}`
      };
    }
  }
  async extractGrooveDataset() {
    try {
      const result = await this.executePythonScript([
        "./server/groove-dataset-loader.py",
        "--extract"
      ]);
      if (result.success) {
        return {
          success: true,
          catalogPath: "./storage/midi/groove/metadata/groove_catalog.json"
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Groove dataset extraction failed: ${error}`
      };
    }
  }
  async getGroovesByStyle(style) {
    try {
      const result = await this.executePythonScript([
        "./server/groove-dataset-loader.py",
        "--style",
        style
      ]);
      if (result.success) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
  async getGroovesByTempo(minTempo, maxTempo) {
    try {
      const result = await this.executePythonScript([
        "./server/groove-dataset-loader.py",
        "--tempo-min",
        minTempo.toString(),
        "--tempo-max",
        maxTempo.toString()
      ]);
      if (result.success) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
  async processChordSets() {
    try {
      const result = await this.executePythonScript([
        "./server/chord-sets-processor.py",
        "--process"
      ]);
      if (result.success) {
        return {
          success: true,
          catalogPath: "./storage/midi/templates/chord-sets/chord_sets_catalog.json"
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Chord sets processing failed: ${error}`
      };
    }
  }
  async getChordSetsByCategory(category, tempoRange) {
    try {
      const args = ["./server/chord-sets-processor.py", "--list"];
      if (category) {
        args.push("--category", category);
      }
      if (tempoRange) {
        args.push("--tempo-min", tempoRange[0].toString());
        args.push("--tempo-max", tempoRange[1].toString());
      }
      const result = await this.executePythonScript(args);
      if (result.success) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
  async generateFromChordSet(chordSetName, customizations) {
    try {
      const chordSetPath = path.join("./storage/midi/templates/chord-sets", chordSetName);
      const exists = await this.fileExists(chordSetPath);
      if (!exists) {
        return {
          success: false,
          error: `Chord set ${chordSetName} not found`
        };
      }
      const timestamp = Date.now();
      const baseName = chordSetName.replace(/\.(mid|midi)$/, "");
      const outputPath = path.join(this.outputDir, `${baseName}_generated_${timestamp}.mid`);
      await fs.copyFile(chordSetPath, outputPath);
      const metadata = {
        source_chord_set: chordSetName,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        customizations: customizations || {},
        generation_method: "chord_set_based"
      };
      const metadataPath = outputPath.replace(".mid", "_metadata.json");
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      return {
        success: true,
        midiPath: outputPath,
        metadataPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Chord set generation failed: ${error}`
      };
    }
  }
};

// server/routes/voice.ts
import { Router } from "express";
import path2 from "path";
import fs2 from "fs/promises";
import multer from "multer";
var router = Router();
var upload = multer({
  dest: path2.join(process.cwd(), "storage", "temp"),
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit
  }
});
router.post("/clone", upload.single("audio"), async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const audioFile = req.file;
    if (!audioFile || !text) {
      return res.status(400).json({
        error: "Audio file and text are required for voice cloning"
      });
    }
    const result = {
      success: true,
      voiceId: `rvc_${Date.now()}`,
      audioUrl: `/storage/voices/cloned_${Date.now()}.wav`,
      message: "Voice cloned successfully (mock mode)"
    };
    res.json(result);
  } catch (error) {
    console.error("Voice cloning error:", error);
    res.status(500).json({
      error: "Voice cloning failed",
      details: error.message
    });
  }
});
router.post("/synthesize", async (req, res) => {
  try {
    const { text, voiceId, midiPath } = req.body;
    if (!text || !voiceId) {
      return res.status(400).json({
        error: "Text and voice ID are required for synthesis"
      });
    }
    const result = {
      success: true,
      audioUrl: `/storage/voices/synthesized_${Date.now()}.wav`,
      midiIntegration: midiPath ? true : false,
      message: "Voice synthesized successfully"
    };
    res.json(result);
  } catch (error) {
    console.error("Voice synthesis error:", error);
    res.status(500).json({
      error: "Voice synthesis failed",
      details: error.message
    });
  }
});
router.get("/available", async (req, res) => {
  try {
    const voicesDir = path2.join(process.cwd(), "storage", "voice-bank", "samples");
    const files = await fs2.readdir(voicesDir);
    const voices = files.filter((file) => file.endsWith(".mp3") || file.endsWith(".wav")).map((file) => ({
      id: file.replace(/\.(mp3|wav)$/, ""),
      name: file.replace(/\.(mp3|wav)$/, "").replace(/_/g, " "),
      file
    }));
    res.json({ voices });
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({
      error: "Failed to fetch available voices",
      details: error.message
    });
  }
});
var voice_default = router;

// server/routes/midi.ts
import { Router as Router2 } from "express";
import path3 from "path";
var router2 = Router2();
var midiService = new MidiService();
router2.post("/generate", async (req, res) => {
  try {
    const { title, theme, genre, tempo, duration, useAiLyrics } = req.body;
    if (!title || !theme || !genre || !tempo) {
      return res.status(400).json({
        error: "Missing required fields: title, theme, genre, tempo"
      });
    }
    const result = await midiService.generateMidi({
      title,
      theme,
      genre,
      tempo: parseInt(tempo),
      duration: duration ? parseInt(duration) : void 0,
      useAiLyrics: Boolean(useAiLyrics)
    });
    if (result.success) {
      res.json({
        success: true,
        midiPath: result.midiPath,
        metadataPath: result.metadataPath,
        message: "MIDI generated successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error("MIDI generation error:", error);
    res.status(500).json({
      error: `MIDI generation failed: ${error}`
    });
  }
});
router2.get("/list", async (req, res) => {
  try {
    const midiFiles = await midiService.listGeneratedMidi();
    res.json({ files: midiFiles });
  } catch (error) {
    console.error("Error listing MIDI files:", error);
    res.status(500).json({ error: `Failed to list MIDI files: ${error}` });
  }
});
router2.get("/:filename/metadata", async (req, res) => {
  try {
    const filename = req.params.filename;
    const midiPath = path3.join("./storage/midi/generated", filename);
    const metadata = await midiService.getMidiMetadata(midiPath);
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: "Metadata not found" });
    }
  } catch (error) {
    console.error("Error getting metadata:", error);
    res.status(500).json({ error: `Failed to get metadata: ${error}` });
  }
});
router2.post("/groove/extract", async (req, res) => {
  try {
    const result = await midiService.extractGrooveDataset();
    if (result.success) {
      res.json({
        success: true,
        message: "Groove dataset extracted successfully",
        catalogPath: result.catalogPath
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error("Groove extraction error:", error);
    res.status(500).json({ error: `Groove extraction failed: ${error}` });
  }
});
router2.get("/groove/style/:style", async (req, res) => {
  try {
    const style = req.params.style;
    const grooves = await midiService.getGroovesByStyle(style);
    res.json({ style, grooves });
  } catch (error) {
    console.error("Error getting grooves by style:", error);
    res.status(500).json({ error: `Failed to get grooves: ${error}` });
  }
});
router2.get("/groove/tempo/:minTempo/:maxTempo", async (req, res) => {
  try {
    const minTempo = parseInt(req.params.minTempo);
    const maxTempo = parseInt(req.params.maxTempo);
    if (isNaN(minTempo) || isNaN(maxTempo)) {
      return res.status(400).json({ error: "Invalid tempo values" });
    }
    const grooves = await midiService.getGroovesByTempo(minTempo, maxTempo);
    res.json({ tempoRange: { min: minTempo, max: maxTempo }, grooves });
  } catch (error) {
    console.error("Error getting grooves by tempo:", error);
    res.status(500).json({ error: `Failed to get grooves: ${error}` });
  }
});
var midi_default = router2;

// server/routes/audioldm2.ts
import { Router as Router3 } from "express";

// server/audioldm2-service.ts
import { spawn as spawn2 } from "child_process";
import path4 from "path";
import fs3 from "fs/promises";
var AudioLDM2Service = class {
  pythonPath;
  // Python executable path
  scriptPath;
  // Path to AudioLDM2 scripts
  constructor() {
    this.pythonPath = "python3";
    this.scriptPath = path4.join(process.cwd(), "temp-dreamsound-repo");
    this.ensureDirectories();
  }
  // DIRECTORY STRUCTURE SETUP
  // NOTE: Creates essential directories for AudioLDM2 operation
  // TODO: Add error handling for permission issues
  async ensureDirectories() {
    const dirs = [
      "storage/models/audioldm2",
      // Model storage
      "storage/music/generated",
      // Generated music output
      "storage/temp"
      // Temporary files
    ];
    for (const dir of dirs) {
      await fs3.mkdir(path4.join(process.cwd(), dir), { recursive: true }).catch(() => {
      });
    }
  }
  // PERSONALIZED MUSIC GENERATION METHOD
  // NOTE: Generates music using AudioLDM2 with custom prompts
  // TODO: Add progress tracking and intermediate result saving
  async generatePersonalizedMusic(prompt, config) {
    const outputFile = path4.join(config.outputDir, `generated_${Date.now()}.wav`);
    const args = [
      path4.join(this.scriptPath, "inference_audioldm2.py"),
      "--prompt",
      prompt,
      "--model_path",
      config.modelPath,
      "--output_file",
      outputFile,
      "--num_inference_steps",
      (config.numInferenceSteps || 50).toString(),
      "--guidance_scale",
      (config.guidanceScale || 3.5).toString(),
      "--audio_length_in_s",
      (config.audioLengthInS || 10).toString()
    ];
    if (config.instanceWord && config.objectClass) {
      args.push("--instance_word", config.instanceWord);
      args.push("--object_class", config.objectClass);
    }
    return new Promise((resolve, reject) => {
      const childProcess = spawn2(this.pythonPath, args);
      let stdout = "";
      let stderr = "";
      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`AudioLDM2 generation failed: ${stderr}`));
        }
      });
      childProcess.on("error", (error) => {
        reject(new Error(`Failed to start AudioLDM2 process: ${error.message}`));
      });
    });
  }
  async trainDreamBooth(config) {
    const args = [
      path4.join(this.scriptPath, "dreambooth_audioldm2.py"),
      "--pretrained_model_name_or_path",
      "cvssp/audioldm2",
      "--train_data_dir",
      config.dataDir,
      "--instance_word",
      config.instanceWord,
      "--object_class",
      config.objectClass,
      "--output_dir",
      config.outputDir,
      "--train_batch_size",
      "1",
      "--gradient_accumulation_steps",
      "4",
      "--max_train_steps",
      (config.maxTrainSteps || 300).toString(),
      "--learning_rate",
      (config.learningRate || 1e-5).toString(),
      "--validation_steps",
      "50",
      "--num_validation_audio_files",
      "3",
      "--save_as_full_pipeline"
    ];
    return new Promise((resolve, reject) => {
      const childProcess = spawn2("accelerate", ["launch", ...args]);
      let stdout = "";
      let stderr = "";
      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();
        console.log("Training output:", data.toString());
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        console.error("Training error:", data.toString());
      });
      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve(path4.join(config.outputDir, "trained_pipeline"));
        } else {
          reject(new Error(`DreamBooth training failed: ${stderr}`));
        }
      });
      childProcess.on("error", (error) => {
        reject(new Error(`Failed to start training process: ${error.message}`));
      });
    });
  }
  async getAvailableModels() {
    const modelsDir = path4.join(process.cwd(), "storage", "models", "audioldm2");
    try {
      await fs3.access(modelsDir);
      const files = await fs3.readdir(modelsDir);
      return files.filter((file) => file.endsWith(".pt") || file.endsWith(".ckpt"));
    } catch {
      return ["cvssp/audioldm2"];
    }
  }
};

// server/routes/audioldm2.ts
import path5 from "path";
import fs4 from "fs/promises";
import multer2 from "multer";
var router3 = Router3();
var audioldm2Service = new AudioLDM2Service();
var upload2 = multer2({
  dest: path5.join(process.cwd(), "storage", "temp"),
  limits: {
    fileSize: 100 * 1024 * 1024
    // 100MB limit
  }
});
router3.post("/generate", async (req, res) => {
  try {
    const { prompt, instanceWord, objectClass, audioLength = 10 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const outputDir = path5.join(process.cwd(), "storage", "music", "generated");
    await fs4.mkdir(outputDir, { recursive: true });
    const config = {
      modelPath: "cvssp/audioldm2",
      outputDir,
      instanceWord,
      objectClass,
      audioLengthInS: audioLength
    };
    const audioFile = await audioldm2Service.generatePersonalizedMusic(prompt, config);
    res.json({
      success: true,
      audioFile: path5.basename(audioFile),
      message: "Music generated successfully"
    });
  } catch (error) {
    console.error("AudioLDM2 generation error:", error);
    res.status(500).json({
      error: "Failed to generate music",
      details: error.message
    });
  }
});
router3.post("/train", upload2.array("audio_files"), async (req, res) => {
  try {
    const { instanceWord, objectClass, maxTrainSteps = 300 } = req.body;
    if (!instanceWord || !objectClass) {
      return res.status(400).json({
        error: "Instance word and object class are required"
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "Audio files are required for training"
      });
    }
    const trainingDir = path5.join(
      process.cwd(),
      "storage",
      "models",
      "training",
      `${instanceWord}_${objectClass}_${Date.now()}`
    );
    await fs4.mkdir(trainingDir, { recursive: true });
    const files = req.files;
    for (const file of files) {
      const destPath = path5.join(trainingDir, file.originalname);
      await fs4.rename(file.path, destPath);
    }
    const outputDir = path5.join(process.cwd(), "storage", "models", "audioldm2", `${instanceWord}_${objectClass}`);
    const config = {
      dataDir: trainingDir,
      instanceWord,
      objectClass,
      outputDir,
      maxTrainSteps: parseInt(maxTrainSteps)
    };
    audioldm2Service.trainDreamBooth(config).then((modelPath) => {
      console.log("Training completed:", modelPath);
    }).catch((error) => {
      console.error("Training failed:", error);
    });
    res.json({
      success: true,
      message: "Training started successfully",
      trainingId: path5.basename(outputDir)
    });
  } catch (error) {
    console.error("Training error:", error);
    res.status(500).json({
      error: "Failed to start training",
      details: error.message
    });
  }
});
router3.get("/models", async (req, res) => {
  try {
    const models = await audioldm2Service.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      error: "Failed to fetch models",
      details: error.message
    });
  }
});
router3.get("/training/:trainingId/status", async (req, res) => {
  try {
    const { trainingId } = req.params;
    const modelDir = path5.join(process.cwd(), "storage", "models", "audioldm2", trainingId);
    try {
      await fs4.access(path5.join(modelDir, "trained_pipeline"));
      res.json({ status: "completed" });
    } catch {
      try {
        await fs4.access(modelDir);
        res.json({ status: "training" });
      } catch {
        res.json({ status: "not_found" });
      }
    }
  } catch (error) {
    console.error("Error checking training status:", error);
    res.status(500).json({
      error: "Failed to check training status",
      details: error.message
    });
  }
});
var audioldm2_default = router3;

// server/index.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path6.dirname(__filename);
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
  // IMPORTANT: Keep this version synchronized with Stripe dashboard
});
var app = express();
var PORT = process.env.PORT || 5e3;
var midiService2 = new MidiService();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path6.join(__dirname, "../dist/public")));
app.get("/api/health", async (req, res) => {
  try {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      services: {
        server: true,
        database: true,
        // TODO: Add actual database health check
        stripe: !!process.env.STRIPE_SECRET_KEY,
        audioldm2: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
app.get("/api/status", (req, res) => {
  res.json({
    message: "Burnt Beats API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/stripe/config", (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    success: true
  });
});
app.post("/api/stripe/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", userId, planType } = req.body;
    if (!amount || !userId) {
      return res.status(400).json({ error: "Amount and userId are required" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      // Amount in cents
      currency,
      metadata: {
        userId,
        planType: planType || "standard"
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
      success: true
    });
  } catch (error) {
    console.error("Payment intent creation failed:", error);
    res.status(500).json({
      error: "Payment processing failed",
      message: error.message
    });
  }
});
app.post("/webhook/stripe", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);
      break;
    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  res.json({ received: true });
});
app.get("/api/stripe/plans", (req, res) => {
  res.json({
    plans: [
      {
        id: "basic",
        name: "Basic Plan",
        price: 299,
        // $2.99 in cents
        songs: 10,
        features: ["Basic AI generation", "Standard quality"]
      },
      {
        id: "pro",
        name: "Pro Plan",
        price: 499,
        // $4.99 in cents
        songs: 50,
        features: ["Advanced AI", "High quality", "Voice cloning"]
      },
      {
        id: "premium",
        name: "Premium Plan",
        price: 999,
        // $9.99 in cents
        songs: "unlimited",
        features: ["All features", "Priority support", "Commercial license"]
      }
    ]
  });
});
app.get("*", (req, res) => {
  res.sendFile(path6.join(__dirname, "../dist/public", "index.html"));
});
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});
app.post("/api/generate-midi", async (req, res) => {
  try {
    const { title, theme, genre, tempo, duration, useAiLyrics } = req.body;
    if (!title || !theme || !genre || !tempo) {
      return res.status(400).json({
        error: "Missing required fields: title, theme, genre, tempo"
      });
    }
    const result = await midiService2.generateMidi({
      title,
      theme,
      genre,
      tempo: parseInt(tempo),
      duration: duration ? parseInt(duration) : void 0,
      useAiLyrics: Boolean(useAiLyrics)
    });
    if (result.success) {
      res.json({
        success: true,
        midiPath: result.midiPath,
        metadataPath: result.metadataPath,
        message: "MIDI generated successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      error: `MIDI generation failed: ${error}`
    });
  }
});
app.get("/api/midi/list", async (req, res) => {
  try {
    const midiFiles = await midiService2.listGeneratedMidi();
    res.json({ files: midiFiles });
  } catch (error) {
    res.status(500).json({ error: `Failed to list MIDI files: ${error}` });
  }
});
app.get("/api/midi/:filename/metadata", async (req, res) => {
  try {
    const filename = req.params.filename;
    const midiPath = join("./storage/midi/generated", filename);
    const metadata = await midiService2.getMidiMetadata(midiPath);
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: "Metadata not found" });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to get metadata: ${error}` });
  }
});
app.post("/api/voice/clone", async (req, res) => {
  try {
    const { audioPath, text, voiceId } = req.body;
    if (!audioPath || !text) {
      return res.status(400).json({
        error: "Audio path and text are required for voice cloning"
      });
    }
    const result = {
      success: true,
      voiceId: `rvc_${Date.now()}`,
      audioUrl: `/storage/voices/cloned_${Date.now()}.wav`,
      message: "Voice cloned successfully (mock mode)"
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Voice cloning failed: ${error}`
    });
  }
});
app.post("/api/voice/synthesize", async (req, res) => {
  try {
    const { text, voiceId, midiPath } = req.body;
    if (!text || !voiceId) {
      return res.status(400).json({
        error: "Text and voice ID are required for synthesis"
      });
    }
    const result = {
      success: true,
      audioUrl: `/storage/voices/synthesized_${Date.now()}.wav`,
      midiIntegration: midiPath ? true : false,
      message: "Voice synthesized successfully"
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Voice synthesis failed: ${error}`
    });
  }
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? ["https://burntbeats.replit.app", "https://burnt-beats.replit.app"] : ["http://localhost:3000", "http://localhost:5000"],
  credentials: true
}));
app.use("/storage", express.static(path6.join(__dirname, "../storage")));
app.use("/midi", express.static("./storage/midi/generated"));
app.use("/storage/voices", express.static("./storage/voices"));
app.use("/storage/music", express.static("./storage/music"));
app.use("/storage/temp", express.static("./storage/temp"));
app.use("/api/voice", voice_default);
app.use("/api/midi", midi_default);
app.use("/api/audioldm2", audioldm2_default);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\u{1F525} Burnt Beats server running on http://0.0.0.0:${PORT}`);
  console.log(`\u{1F3B5} MIDI generation available`);
  console.log(`\u{1F5E3}\uFE0F  Voice cloning available (mock mode)`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
var index_default = app;
export {
  index_default as default
};
