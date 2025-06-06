const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; // Use promises for async file reading
const path = require('path');
const Docker = require('dockerode');
const os = require('os'); // For tmpdir
const { v4: uuidv4 } = require('uuid'); // For unique directory names
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001;
const docker = new Docker(); // Assumes Docker is available

app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', apiLimiter); // Apply to all /api routes


// Helper function to load tools (can be refactored later)
async function getToolsConfig() {
  const toolsFilePath = path.join(__dirname, 'tools.json');
  const data = await fs.readFile(toolsFilePath, 'utf8');
  return JSON.parse(data);
}

// Placeholder for the existing /api endpoint (or remove if not needed)
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// New endpoint to list tools
app.get('/api/tools', async (req, res, next) => { // Added next
  try {
    const tools = await getToolsConfig(); // Use helper
    res.json(tools);
  } catch (error) {
    // Pass errors to the global error handler
    next(error);
  }
});

app.post('/api/tools/:toolName/run', async (req, res, next) => { // Added next
  const { toolName } = req.params;
  const userParameters = req.body; // e.g., { "Target": "scanme.nmap.org", "Scan Type": "sS" }

  try {
    const tools = await getToolsConfig();
    const tool = tools.find(t => t.id === toolName);

    if (!tool) {
      return res.status(404).json({ message: `Tool '${toolName}' not found.` });
    }

    // --- Basic Input Validation ---
    const missingParams = [];
    for (const paramDef of tool.parameters) {
      if (paramDef.required && !userParameters[paramDef.name]) {
        missingParams.push(paramDef.name);
      }
    }
    if (missingParams.length > 0) {
      return res.status(400).json({ message: `Missing required parameters: ${missingParams.join(', ')}` });
    }

    // --- Construct Command for Docker ---
    let command = [];
    // Specific logic for nmap command construction
    if (tool.id === 'nmap') {
        command.push('nmap');
        const targetParam = tool.parameters.find(p => p.name === 'Target');
        const targetValue = userParameters[targetParam.name];

        // Handle Scan Type
        const scanTypeParam = tool.parameters.find(p => p.name === 'Scan Type');
        if (userParameters[scanTypeParam.name] && userParameters[scanTypeParam.name] !== scanTypeParam.default) {
            command.push(`-${userParameters[scanTypeParam.name]}`);
        } else if (scanTypeParam.default) {
            command.push(`-${scanTypeParam.default}`);
        }

        // Handle Timing Template
        const timingParam = tool.parameters.find(p => p.name === 'Timing Template');
        if (userParameters[timingParam.name] && userParameters[timingParam.name] !== timingParam.default) {
            command.push(`-T${userParameters[timingParam.name]}`);
        } else if (timingParam.default) {
            command.push(`-T${timingParam.default}`);
        }

        // Add other options if provided
        const otherOptionsParam = tool.parameters.find(p => p.name === 'Other Options');
        if (userParameters[otherOptionsParam.name]) {
            command.push(...userParameters[otherOptionsParam.name].split(' '));
        }

        command.push(targetValue); // Target is usually last for nmap before output options
    } else if (tool.id === 'metasploit') {
        // For Metasploit, the command is more complex and often involves piping to msfconsole
        // or using msfvenom. This is a placeholder and will need significant refinement.
        // A common pattern is to run msfconsole with a resource script.
        // For now, let's assume a simple echo command for testing docker interaction.
        command = ['echo', 'Metasploit execution placeholder:', JSON.stringify(userParameters)];
    } else {
        // Generic command construction - needs more thought for other tools
        // This is a very basic example and might not work for all tools
        command.push(tool.id); // Assuming tool id is the command
        for (const paramDef of tool.parameters) {
            const userValue = userParameters[paramDef.name];
            if (userValue) {
                if (paramDef.flag) { command.push(paramDef.flag); }
                command.push(userValue);
            }
        }
    }

    // --- Docker Execution ---
    let containerOutput = '';
    let containerError = '';
    let outputFiles = [];

    // Create a unique temporary directory on the host for this execution
    const tempDirPrefix = path.join(os.tmpdir(), `pentest-tool-${tool.id}-`);
    const hostTempDir = await fs.mkdtemp(tempDirPrefix);
    const containerOutputDir = '/data'; // Standard output directory inside the container

    // Add output options to Nmap command to save all formats to the container's /data directory
    if (tool.id === 'nmap') {
        const outputBaseName = `nmap_output_${uuidv4()}`;
        command.push('-oA', path.join(containerOutputDir, outputBaseName)); // -oA saves in Nmap, XML, and Grepable formats
    }

    console.log(`Executing Docker command: ${command.join(' ')} for image ${tool.dockerImage}`);
    console.log(`Host temp directory: ${hostTempDir}`);

    const streamToString = (stream) => {
        return new Promise((resolve, reject) => {
            let data = '';
            stream.on('data', chunk => data += chunk.toString('utf8'));
            stream.on('end', () => resolve(data));
            stream.on('error', reject);
        });
    };

    try {
        // Note: docker.run streams stdout/stderr to the calling process's streams by default.
        // To capture them, we pass null for the output stream argument and then get logs.
        const [runResult, container] = await docker.run(tool.dockerImage, command, null, {
          HostConfig: {
            AutoRemove: true,
            Binds: [`${hostTempDir}:${containerOutputDir}`]
          },
          Tty: false
        });

        // Fetch logs for stdout and stderr
        // A more robust solution uses createContainer, attach, start, wait for separate streams.
        const logStream = await container.logs({ stdout: true, stderr: true, follow: false }); // Set follow to false to get logs after execution

        // For now, assume logStream gives combined output or primarily stdout for many CLI tools
        // Proper demultiplexing of Docker's stream format would be needed for true separation here.
        containerOutput = await streamToString(logStream);

        if (runResult.StatusCode !== 0) {
            // If status code is non-zero, the output captured might be the error message.
            containerError = `Tool exited with status code ${runResult.StatusCode}. Output:\n${containerOutput}`;
        }

        // List files in hostTempDir to find generated outputs
        const filesInHostTempDir = await fs.readdir(hostTempDir);
        outputFiles = filesInHostTempDir.map(file => ({
            name: file,
            // downloadLink: `/api/download/${runId}/${file}` // Future: implement download endpoint
        }));

        console.log(`Tool ${tool.id} execution completed. Status Code: ${runResult.StatusCode}`);
        console.log(`Output files:`, outputFiles);

    } catch (err) {
        console.error(`Docker execution error for ${tool.id}:`, err);
        containerError = err.message || 'Failed to run Docker container.';
        if (err.json && err.json.message) { // Dockerode often puts detailed error in err.json.message
            containerError = err.json.message;
        }
        await fs.rm(hostTempDir, { recursive: true, force: true }).catch(e => console.error('Failed to cleanup temp dir on error:', e));
        // It's important to return here if docker.run fails, otherwise it might try to process results that don't exist
        return res.status(500).json({ message: 'Error executing tool.', error: containerError });
    }

    // Clean up the temporary directory after successful execution or if there was a tool error (non-zero exit code)
    await fs.rm(hostTempDir, { recursive: true, force: true }).catch(e => console.error('Failed to cleanup temp dir:', e));

    res.json({
      tool: tool.id,
      status: (runResult.StatusCode !== 0 || containerError) ? 'error' : 'success', // Check runResult.StatusCode too
      output: containerOutput, // This will contain combined stdout/stderr from logs
      error: containerError, // Specific error messages if any
      files: outputFiles,
      statusCode: runResult.StatusCode // Include the tool's exit code
    });

  } catch (error) {
    console.error(`Error in /api/tools/${toolName}/run:`, error);
    // Pass errors to the global error handler
    next(error);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack || err);

  // If headers already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred.',
    // Optionally include stack in development
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
