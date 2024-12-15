const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const converter = require("curl-to-postmanv2");

const app = express();
// need to use cors to allow call from any origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

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
