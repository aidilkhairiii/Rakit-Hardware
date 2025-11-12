import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { exec } from "child_process";

dotenv.config();

// ============================
// 🧩 Setup & Globals
// ============================
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

let latestBP = "";
let latestSpo2 = "";
let latestSpo2Value = null;
let latestBpmValue = null;
let latestTempValue = null;

// ============================
// 🔗 MongoDB Connection
// ============================
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    dbName: "test",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const sessionSchema = new mongoose.Schema(
  { sessionId: String, createdAt: Date },
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
    updatedAt: Date,
  },
  { collection: "parameters" }
);

const Session = mongoose.model("Session", sessionSchema);
const Parameter = mongoose.model("Parameter", parameterSchema);

// ============================
// 🩺 POST BP DATA
// ============================
app.post("/api/data", async (req, res) => {
  latestBP = req.body.value || "";
  console.log("🩺 Received BP:", latestBP);

  // Proceed only if we received final reading
  if (latestBP.includes("Result")) {
    const bpMatch = latestBP.match(/(\d+)\s*\/\s*(\d+)/);
    const bpmMatch = latestBP.match(/BPM\s*:\s*(\d+)/);

    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      const heartRate = bpmMatch ? parseInt(bpmMatch[1]) : latestBpmValue || null;

      // Save all except temperature
      await saveBPResult({
        systolic,
        diastolic,
        heartRate,
        oxygenLevel: latestSpo2Value,
      });
    }
  }

  res.json({ success: true });
});

app.post("/run-postdata", (req, res) => {
  exec("node postData.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
    }
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
  });
});

app.post("/run-postspo", (req, res) => {
  // Set timeout = 10 seconds (10,000 ms)
  exec("node postSpo2.js", { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      // This happens if the process times out or exits with error
      if (error.killed) {
        console.log("✅ postSpo2.js automatically stopped after 10 seconds.");
      }
      console.error(`Error: ${error.message}`);
    }

    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
  });
});

app.post("/run-posttemp", (req, res) => {
  exec("node temp-sender.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send("Error running script.");
    }
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
  });
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

// ============================
// 🌡️ POST TEMP DATA
// ============================
app.post("/api/temp", async (req, res) => {
  let latestTemp = req.body.value || "";
  const tempMatch = latestTemp.match(/([0-9]+\.?[0-9]*)\s*°?\s*[Cc]?/);
  latestTempValue = tempMatch ? parseFloat(tempMatch[1]) : null;

  console.log(
    "🌡️ Received Temperature:",
    latestTempValue ? `${latestTempValue}°C` : latestTemp
  );

  // ✅ Just update DB (do NOT reset)
  if (latestTempValue !== null) {
    await updateTemperatureOnly(latestTempValue);
    console.log("✅ Temperature updated and retained on final screen.");
  }

  res.json({ success: true });
});

// ============================
// 🧠 GET LATEST COMBINED VALUE
// ============================
app.get("/api/latest", (req, res) => {
  res.json({
    bp: latestBP,
    spo2: latestSpo2,
    temp: latestTempValue ? `Temp : ${latestTempValue}°C` : "",
  });
});

// ============================
// 🚪 RESET on Browser Exit
// ============================
app.post("/api/reset", (req, res) => {
  console.log("🚪 Client exited or refreshed — resetting system...");
  resetSystem();
  res.json({ success: true });
});

// ============================
// 💾 SAVE BP RESULT (No Temp)
// ============================
async function saveBPResult({ systolic, diastolic, oxygenLevel, heartRate }) {
  try {
    const latestSession = await Session.findOne().sort({ createdAt: -1 });
    if (!latestSession) {
      console.log("⚠️ No session found in test.sessions");
      return;
    }

    const sid = latestSession.sessionId;
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
        updatedAt: new Date(),
      });
      await newParam.save();
      console.log(`🆕 Created new parameter for session ${sid}`);
    } else {
      await Parameter.updateOne(
        { sessionId: sid },
        {
          $set: {
            "bloodPressure.systolic": systolic,
            "bloodPressure.diastolic": diastolic,
            "bloodPressure.createdAt": new Date(),
            heartRate,
            oxygenLevel,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Updated BP & SpO₂ for session ${sid}`);
    }
  } catch (err) {
    console.error("❌ Error saving BP result:", err);
  }
}

// ============================
// 🌡️ UPDATE TEMPERATURE ONLY
// ============================
async function updateTemperatureOnly(temperature) {
  try {
    const latestSession = await Session.findOne().sort({ createdAt: -1 });
    if (!latestSession) {
      console.log("⚠️ No session found for temperature update");
      return;
    }

    const sid = latestSession.sessionId;

    await Parameter.updateOne(
      { sessionId: sid },
      {
        $set: {
          temperature,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`🌡️ Temperature updated for session ${sid}: ${temperature}°C`);
  } catch (err) {
    console.error("❌ Error updating temperature:", err);
  }
}

// ============================
// 🔄 RESET ALL VALUES
// ============================
function resetSystem() {
  console.log("🔄 Resetting all readings for new user...");
  latestBP = "";
  latestSpo2 = "";
  latestSpo2Value = null;
  latestBpmValue = null;
  latestTempValue = null;
  console.log("✅ System reset complete — ready for next user.\n");
}

// ============================
// 🚀 Start Server
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
