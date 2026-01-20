// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3000;
const HTML_DIR = path.join(__dirname, "html");

const TEMPLATE_PATH = path.join(__dirname, "template/base.html");
const CSS_PATH = path.join(__dirname, "template/post.css");

function buildHtmlDocument(content: string): string {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const css = fs.readFileSync(CSS_PATH, "utf-8");

  return template
    .replace("CSS_EMBEDDED_CONTENT", css)
    .replace("HTML_EMBEDDED_CONTENT", content);
}


const corsOptions = {
  origin: 'http://localhost:5173', // Allow only this origin
}

app.use(cors(corsOptions));
app.use(express.json());

if (!fs.existsSync(HTML_DIR)) {
  fs.mkdirSync(HTML_DIR, { recursive: true });
}

app.get("/files", (_, res) => {
  fs.readdir(HTML_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read folder" });
    }
    res.json(files);
  });
});

app.post("/files", (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({ error: "filename and content are required" });
  }

  const filePath = path.join(HTML_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: "File already exists" });
  }

  const finalHtml = buildHtmlDocument(content);

  fs.writeFile(filePath, finalHtml, (err) => {
    if (err) return res.status(500).json({ error: "Unable to write file" });
    res.json({ message: "File created successfully" });
  });
});

app.put("/files/:filename", (req, res) => {
  const { filename } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  const filePath = path.join(HTML_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File does not exist" });
  }

  const finalHtml = buildHtmlDocument(content);

  fs.writeFile(filePath, finalHtml, (err) => {
    if (err) return res.status(500).json({ error: "Unable to update file" });
    res.json({ message: "File updated successfully" });
  });
});

app.get("/files/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(HTML_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File does not exist" });
  }

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Unable to read file" });
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
