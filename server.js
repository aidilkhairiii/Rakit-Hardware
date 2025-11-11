import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

let latestTempValue = null; // ✅ Add this at the top


dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// ============================
// 🔗 MongoDB Connection
// ============================
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    dbName: "test", // 🔥 use your actual DB name shown in screenshot
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================
// 🧩 Schemas
// ============================
const sessionSchema = new mongoose.Schema(
  {
    sessionId: String,
    createdAt: Date,
  },
  { collection: "sessions" }
);

const parameterSchema = new mongoose.Schema(
  {
    sessionId: String,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      createdAt: Date,
    },
    heartRate: Number,
    oxygenLevel: Number,
    temperature: Number,
    glucoseLevel: Number,
    ecgStatus: String,
    gender: String,
    height: Number,
    weight: Number,
    age: Number,
    updatedAt: Date,
  },
  { collection: "parameters" }
);

const Session = mongoose.model("Session", sessionSchema);
const Parameter = mongoose.model("Parameter", parameterSchema);

// ============================
// 🔄 Variables
// ============================
let latestBP = "";
let latestSpo2 = "";
let latestSpo2Value = null;
let latestBpmValue = null;

// ============================
// 🩺 POST BP DATA
// ============================
app.post("/api/data", async (req, res) => {
  latestBP = req.body.value || "";
  console.log("🩺 Received BP:", latestBP);

  // Only proceed if "Result" (final reading)
  if (latestBP.includes("Result")) {
    const bpMatch = latestBP.match(/(\d+)\s*\/\s*(\d+)/);
    const bpmMatch = latestBP.match(/BPM\s*:\s*(\d+)/);

    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      const heartRate = bpmMatch ? parseInt(bpmMatch[1]) : latestBpmValue || null;

      await saveFinalResult({
        systolic: null,
        diastolic: null,
        heartRate: latestBpmValue,
        oxygenLevel: latestSpo2Value,
        temperature: latestTempValue
      });
      
    }
  }

  res.json({ success: true });
});


// ============================
// 🫁 POST SpO₂ DATA
// ============================
app.post("/api/spo2", (req, res) => {
  latestSpo2 = req.body.value || "";
  const spo2Match = latestSpo2.match(/SpO2\s*:\s*(\d+)%/);
  const bpmMatch = latestSpo2.match(/BPM\s*:\s*(\d+)/);

  latestSpo2Value = spo2Match ? parseInt(spo2Match[1]) : null;
  latestBpmValue = bpmMatch ? parseInt(bpmMatch[1]) : null;

  console.log("🫁 Received SpO₂:", latestSpo2);
  res.json({ success: true });
});

app.post("/api/temp", (req, res) => {
  let latestTemp = req.body.value || "";
  const tempMatch = latestTemp.match(/([0-9]+\.?[0-9]*)\s*°?\s*[Cc]?/);

  // Extract temperature as float
  latestTempValue = tempMatch ? parseFloat(tempMatch[1]) : null;

  console.log("🌡️ Received Temperature:", latestTempValue ? `${latestTempValue}°C` : latestTemp);
  res.json({ success: true });
});


// ============================
// 🧠 GET LATEST COMBINED VALUE
// ============================
app.get("/api/latest", (req, res) => {
  res.json({
    bp: latestBP,
    spo2: latestSpo2,
    temp: `Temp : ${latestTempValue}°C`,
  });  
});


// ============================
// 💾 SAVE FINAL RESULT
// ============================
async function saveFinalResult({ systolic, diastolic, oxygenLevel, heartRate, temperature }) {
  try {
    // Find latest session in test.sessions
    const latestSession = await Session.findOne().sort({ createdAt: -1 });

    if (!latestSession) {
      console.log("⚠️ No session found in test.sessions");
      return;
    }

    const sid = latestSession.sessionId;

    // Check if parameter already exists
    const existingParam = await Parameter.findOne({ sessionId: sid });

    if (!existingParam) {
      const newParam = new Parameter({
        sessionId: sid,
        bloodPressure: {
          systolic,
          diastolic,
          createdAt: new Date(),
        },
        heartRate,
        oxygenLevel,
        temperature, // ✅ include temperature
        updatedAt: new Date(),
      });
      await newParam.save();
      console.log(`🆕 Created new parameter for session ${sid}`);
    } else {
      // Update only fields we care about
      await Parameter.updateOne(
        { sessionId: sid },
        {
          $set: {
            "bloodPressure.systolic": systolic,
            "bloodPressure.diastolic": diastolic,
            "bloodPressure.createdAt": new Date(),
            heartRate,
            oxygenLevel,
            temperature, // ✅ add this
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Updated existing parameter for session ${sid}`);
    }

    // Log values clearly
    console.log({
      sessionId: sid,
      systolic,
      diastolic,
      heartRate,
      oxygenLevel,
      temperature, // ✅ log too
    });
  } catch (err) {
    console.error("❌ Error saving final result:", err);
  }
}


// ============================
// 🚀 Start Server
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);