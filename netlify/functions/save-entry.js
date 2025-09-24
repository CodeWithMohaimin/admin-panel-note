const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);

  const repo = "CodeWithMohaimin/admin-panel-note"; // 👈 এখানে তোমার repo
  const filePath = "public/data/entries.json"; 
  const token = process.env.GITHUB_TOKEN;

  // GitHub থেকে ফাইল পড়া
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Accept": "application/vnd.github+json"
}

  });
  const fileData = await getRes.json();

  const content = Buffer.from(fileData.content, "base64").toString("utf8");
  const entries = JSON.parse(content);

  // নতুন entry অ্যাড করো
  const newEntry = {
    id: Date.now(),
    text: body.text,
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);

  // Update GitHub file
  const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Update entries.json",
      content: Buffer.from(JSON.stringify(entries, null, 2)).toString("base64"),
      sha: fileData.sha,
    }),
  });

  if (!updateRes.ok) {
    return { statusCode: 500, body: "Failed to update file" };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, entry: newEntry }),
  };
};
