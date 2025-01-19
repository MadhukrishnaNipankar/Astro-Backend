import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import request from "request";

const app = express();
const PORT = 3000;

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
app.post("/get-planets", async (req, res) => {
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

  const options = {
    method: "POST",
    url: astrologyApiUrl,
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
    res.send({ error: false, data: JSON.parse(response.body) });
  });
});

// Get kundali
app.post("/get-kundali", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
 Based on the provided planetary data for the person’s birth chart, return the output as a valid JSON object with the following strict structure. The response should have exactly five main parts: \`career\`, \`relationships\`, \`personalGrowth\`, \`familyAndSocialConnections\`, and \`kundliOverview\`. Each section can include content as lists or bullet points to enhance readability.

The JSON structure should look like this:
{
[
  {
    "title": "Career",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Relationships",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Personal Growth",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Family and Social Connections",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  }
]
}

### Instructions for the LLM:
1. **Content Style:** Ensure each section has an \`overview\` or \`summary\` to provide a general idea, followed by actionable \`recommendations\` or \`keyPoints\` in bullet points.
2. **Formatting:** Return only valid JSON, adhering strictly to the given structure. Ensure all fields are included, even if the value is empty.
3. **Contextual Accuracy:** Base the recommendations and insights on the individual’s planetary positions and astrological aspects. Provide actionable, relevant, and easy-to-understand suggestions.
4. **Emojis:** Use emojis in string values to enhance readability and user engagement (e.g., 💼 for career, ❤️ for relationships, 🌟 for personal growth, 🏡 for family, and ✨ for the kundli overview).

Use this format strictly, and make the output user-friendly while being concise and actionable. Strictly start response with { and end with } ONLY. Don't include characters like \n or \r or \t. Remeber it should be perfectly like a JSON data string which we can parse afterwards. 

THIS IS THE DATA TO REFER - 
${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/get-ai-recommendations", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Using the provided planetary data, return the output as a valid JSON object with the following strict structure. The response should have exactly three main parts: \`gemstones\`, \`poojaRecommendations\`, and \`kundliOverview\`. Each section can include content as lists or bullet points to enhance readability.

The JSON structure should look like this:
{
[
  {
    "title": "Gemstones",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Pooja Recommendations",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  }
]
}

### Instructions for the LLM:
1. **Content Style:** Ensure each section has an \`overview\` or \`summary\` to provide a general idea, followed by actionable \`recommendations\` or \`keyPoints\` in bullet points.
2. **Formatting:** Return only valid JSON, adhering strictly to the given structure. Ensure all fields are included, even if the value is empty.
3. **Contextual Accuracy:** Base the suggestions and insights on the individual’s planetary positions and astrological aspects. Provide actionable, relevant, and easy-to-understand suggestions.
4. **Emojis:** Use emojis in string values to enhance readability and user engagement (e.g., 💎 for gemstones, 🕉️ for pooja recommendations, and ✨ for the kundli overview).
5. **Gemstone Recommendations:** Include details like the gemstone name, its purpose (e.g., enhancing Venus' energy), and the reason (e.g., Venus signifies love and creativity in the chart).
6. **Pooja Recommendations:** Mention specific rituals, their purpose (e.g., strengthening Mercury), and the reason for their significance.

Use this format strictly, and make the output user-friendly while being concise and actionable. Strictly start response with { and end with } ONLY. Don't include characters like \n or \r or \t. Remember it should be perfectly like a JSON data string which we can parse afterward.

THIS IS THE DATA TO REFER - 
${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: JSON.parse(result.response.text()),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/get-spiritual-content", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Using the provided planetary data, return the output as a valid JSON object with the following strict structure. The response should have exactly three main parts: \`meditationSuggestions\`, \`workoutSuggestions\`, and \`sleepContent\`. Each section can include an \`overview\` and detailed \`recommendations\` in bullet points to enhance readability.

The JSON structure should look like this:

{
[
  {
    "title": "Meditation Suggestions",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Workout Suggestions",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  },
  {
    "title": "Sleep Content",
    "data": {
      "overview": "string",
      "recommendation": "Recommendations here"
    }
  }
]
}

### Instructions for the LLM:
1. **Content Style:** Ensure each section has an \`overview\` to provide a general idea, followed by actionable \`recommendations\` in bullet points for clarity.
2. **Formatting:** Return only valid JSON, adhering strictly to the given structure. Ensure all fields are included, even if the value is empty.
3. **Contextual Accuracy:** Base the suggestions on the individual’s planetary positions and astrological insights. Provide actionable, relevant, and easy-to-follow advice.
4. **Emojis:** Use emojis in string values to enhance readability and user engagement (e.g., 🧘 for meditation, 🏋️ for workouts, and 😴 for sleep content).

Use this format strictly, and make the output user-friendly while being concise and actionable. Strictly start response with { and end with } ONLY. Don't include characters like \n or \r or \t. Remeber it should be perfectly like a JSON data string which we can parse afterwards. 

THIS IS THE DATA TO REFER - 

${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/chat-ai", async (req, res) => {
  const { data } = req.body;
  console.log("Chat input received:", data);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Chat-specific prompt
  const prompt = `
You are an advanced conversational AI specializing in astrology, gemstones, rituals, and personalized guidance. Respond to user queries in a conversational and insightful manner.

Input: "${data}"

Consider the following while crafting your response:
- Be concise yet detailed enough to provide actionable advice.
- Use emojis sparingly but meaningfully to make the response engaging (e.g., 💎 for gemstones, 🕉️ for rituals, or 🌟 for astrological tips).
- Maintain a friendly and professional tone.

Output a response that matches the user’s query, ensuring accuracy and depth in the explanation.
The response should be short and crisp also try to text like a human, don't use markdown
`;

  console.log("Chat prompt:", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log("Chat response:", result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return res.status(400).json({
      error: true,
      errorMessage:
        error.message || "An error occurred while processing the chat input.",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
