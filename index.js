const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const geolocation = require("geolocation");
var request = require("request");
const app = express();
const PORT = 3000;
const cors = require("cors");

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Proxy endpoint
app.post("/proxy", async (req, res) => {
  const apiUrl =
    "https://api.langflow.astra.datastax.com/lf/b816cadf-0d1b-467a-af15-9d08e688f037/api/v1/run/2a0df184-b94a-4d75-b7ca-c9a59f87da49?stream=false";

  const token =
    "AstraCS:YOxHLaQpHCQFTZUoPedbIzIT:122e02639cd757a2a1dde5c38c70535500eb4f2ee1c35a9a0fb9e438b0627cd1"; // Replace with your actual token

  try {
    const apiResponse = await axios.post(apiUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    res.status(apiResponse.status).json(apiResponse.data); // Send back the API's response
  } catch (error) {
    console.error("Error forwarding request to the API:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal server error",
    });
  }
});

// Kundli API Endpoint
app.post("/getkundli", (req, res) => {
  const { name, dob, time, gender, state, city } = req.body;

  if (!name || !dob || !time || !gender || !state || !city) {
    return res.status(400).json({
      error: true,
      errorMessage:
        "All fields (name, dob, time, gender, state, city) are required.",
    });
  }

  // Dummy response
  const data = {
    career: "You have a bright career ahead with many opportunities.",
    relationship:
      "This month, focus on improving communication in relationships.",
    personal_growth:
      "Seek knowledge this month to unlock your personal growth.",
    family: "Spending time with family will bring you joy and support.",
    social_connections: "Your social circle will expand this month.",
    daily_horoscope: "Today, focus on productivity.",
    monthly_horoscope:
      "This month, you might face some challenges, but they'll help you grow.",
    gemstone_suggestions: "Wearing a turquoise stone can bring you good luck.",
    pooja_rituals: "Participating in morning prayers will bring peace.",
    dos: "Do focus on time management.",
    donts: "Avoid unnecessary conflicts.",
    meditation_suggestions: "Try meditation for 15 minutes each morning.",
    workout_suggestions: "Try a 30-minute cardio workout daily.",
    sleep_content: "Ensure you get at least 7-8 hours of sleep nightly.",
  };

  res.status(200).json({ error: false, data }); // Send back the dummy horoscope response with error:false
});

// Function to convert date and time into the desired format
function formatDateTime(data) {
  const [year, month, day] = data.dateOfBirth.split("-"); // Split the date of birth
  const [hour, min] = data.time.split(":"); // Split the time

  return {
    day: parseInt(day),
    month: parseInt(month),
    year: parseInt(year),
    hour: parseInt(hour),
    min: parseInt(min),
  };
}

// New API for GET /getplanets
app.post("/getplanets", async (req, res) => {
  const { name, dateOfBirth, time, gender, state, city } = req.body;

  if (!name || !dateOfBirth || !time || !gender || !state || !city) {
    return res.status(400).json({
      error: true,
      errorMessage:
        "All query parameters (name, dob, time, gender, state, city) are required.",
    });
  }

  const requestData = {
    name,
    dateOfBirth,
    time,
    gender,
    state,
    city,
  };

  const formattedData = formatDateTime(requestData);
  console.log(formattedData);

  // API URL to fetch planetary data
  const astrologyApiUrl = "https://json.astrologyapi.com/v1/planets";

  var options = {
    method: "POST",
    url: "https://json.astrologyapi.com/v1/planets",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic NjM2OTc1OjhmYThmZDUzNzMwYzExNTI1ZGJjMTEyOWQ2MjEyZTNlYTVmMDMwMDI=",
    },
    body: JSON.stringify({
      day: 27,
      month: 6,
      year: 2000,
      hour: 15,
      min: 30,
      lat: 25.7464,
      lon: 82.6837,
      tzone: 5.5,
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // const data = JSON.parse(response.data);
    res.send({ error: false, data: JSON.parse(response.body) });
  });
});
// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});

// User id
// 636975
// Test API Key
// 8fa8fd53730c11525dbc1129d6212e3ea5f03002

// Authorization: Basic NjM2OTc1OjhmYThmZDUzNzMwYzExNTI1ZGJjMTEyOWQ2MjEyZTNlYTVmMDMwMDI=
