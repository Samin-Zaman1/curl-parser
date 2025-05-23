const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const converter = require("curl-to-postmanv2");
const cors = require("cors");
const xml2js = require("xml2js");
const fs = require("fs");
const multer = require("multer");

const app = express();
// need to use cors to allow call from any origin
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());

// For handling binary files
const upload = multer({ dest: 'uploads/' });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

// Parse XML middleware
const xmlParser = express.text({ type: 'application/xml' });

const schema = Joi.object({
  curlCommand: Joi.string().trim().required().regex(/^curl/).messages({
    "string.empty": "The cURL command cannot be empty.",
    "string.pattern.base": "Invalid cURL command format.",
    "any.required": "The cURL command is required.",
  }),
});

app.post("/parse-curl", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { curlCommand } = value;

  try {
    const options = {
      type: "string",
      data: curlCommand,
    };

    converter.convert(options, (err, data) => {
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({
          success: false,
          message:
            "Failed to parse the cURL command. Please ensure it is valid.",
        });
      }

      // Success response
      return res.status(200).json({
        success: true,
        data: data.output[0].data,
      });
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to parse the cURL command. Please ensure it is valid.",
    });
  }
});

// In-memory user database for CRUD operations
let users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];

// CRUD API endpoints
// Get all users
app.get("/api/users", (req, res) => {
  res.json({ success: true, data: users });
});

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
});

// Create new user
app.post("/api/users", (req, res) => {
  const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });
  
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: value.name,
    email: value.email
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Update user
app.put("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
  const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });
  
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  
  user.name = value.name;
  user.email = value.email;
  
  res.json({ success: true, data: user });
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).json({ success: false, message: "User not found" });
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ success: true, data: deletedUser, message: "User deleted successfully" });
});

// Special endpoints for different content types

// Handle x-www-form-urlencoded
app.post("/api/form-data", (req, res) => {
  res.json({
    success: true,
    message: "Form data received successfully",
    data: req.body
  });
});

// Handle binary data
app.post("/api/binary", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  res.json({
    success: true,
    message: "Binary file received successfully",
    fileDetails: {
      filename: req.file.originalname || req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

// Handle XML data
app.post("/api/xml", xmlParser, (req, res) => {
  try {
    // Parse the XML data (in a real app, you'd do something with this)
    xml2js.parseString(req.body, (err, result) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid XML format",
          error: err.message
        });
      }
      
      // For testing, echo the parsed XML as JSON
      const receivedData = {
        parsedXml: result
      };
      
      // Return sample XML response
      const builder = new xml2js.Builder();
      const sampleResponse = {
        response: {
          status: "success",
          message: "XML processed successfully",
          timestamp: new Date().toISOString(),
          data: {
            items: [
              { id: 1, name: "Item One", category: "Electronics" },
              { id: 2, name: "Item Two", category: "Books" }
            ]
          }
        }
      };
      
      const xml = builder.buildObject(sampleResponse);
      
      res.type('application/xml');
      res.send(xml);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing XML data",
      error: error.message
    });
  }
});

// Catch-all route for invalid endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested endpoint does not exist.",
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});