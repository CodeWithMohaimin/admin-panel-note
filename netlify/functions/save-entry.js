const fs = require("fs");
const path = require("path");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const text = body.text?.trim();

    if (!text) {
      return { statusCode: 400, body: JSON.stringify({ error: "Text required" }) };
    }

    // Path to JSON file
    const filePath = path.join(__dirname, "../../data/entries.json");

    // Read old data
    let data = [];
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Add new entry with timestamp
    const newEntry = {
      id: Date.now(),
      text,
      date: new Date().toISOString(),
    };

    data.unshift(newEntry); // add to top

    // Write back to JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify(newEntry),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
