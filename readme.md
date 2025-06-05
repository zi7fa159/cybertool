Prompt for AI to Create the Pentest Toolkit Web App
Create a web application that allows users to run pre-installed, open-source penetration testing tools through a simple and intuitive user interface, without requiring any authentication. The web app should be built using React for the frontend and Node.js for the backend, with Docker used for containerization of the tools.
Key Features

Provide a user-friendly interface where users can select a tool from a list (e.g., Nmap, Metasploit), input the necessary parameters, execute the tool, and view the results.
Integrate at least two penetration testing tools, such as Nmap and Metasploit, and design the system to allow easy addition of more tools in the future.
Each tool should be executed in an isolated Docker container to ensure security and prevent any potential misuse from affecting the host system.
The backend should manage the execution of tools by starting a new Docker container for each request, passing the user-provided parameters, capturing the output, and sending it back to the frontend.
Handle text output from the tools and display it in a readable format. If a tool generates files, provide download links for the user.
Implement proper error handling to display informative messages in case of failures or invalid inputs.
Ensure that user inputs are validated and sanitized to prevent security issues.
Consider implementing additional security measures, such as rate limiting, to prevent abuse given the open nature of the app.
Include a section in the web app with legal disclaimers and usage guidelines, emphasizing that the tools are to be used only for authorized penetration testing and educational purposes.

Technical Requirements

Use React for the frontend to create an interactive and responsive user interface.
Use Node.js for the backend to handle requests, interact with Docker, and manage tool executions.
Utilize Docker to containerize each penetration testing tool, ensuring isolation and security.
Use existing Docker images for the tools where possible (e.g., official Nmap or Metasploit images), or create custom images if necessary.
Configure the Docker containers with the necessary permissions and capabilities required by the tools (e.g., network access for scanning tools like Nmap).

User Flow

User accesses the web app via a public URL.
User sees a list or dashboard of available tools.
User selects a tool and is presented with input fields for parameters.
User submits the request to execute the tool.
The app shows a loading indicator while the tool is running.
Once completed, the app displays the text output or provides download links for generated files.

Security Considerations

Run each tool in an isolated Docker container to prevent any malicious activity from affecting the host system.
Validate and sanitize all user inputs to prevent injection attacks or other security vulnerabilities.
Implement rate limiting or other access controls to mitigate the risk of abuse due to the lack of authentication.

Deployment

The web app should be designed to run on a server with Docker installed and configured.
The app should be accessible via a public URL without any login requirements.

Goal
The overall goal is to provide an easy-to-use platform for running penetration testing tools without the need for users to install the tools themselves, while ensuring security and responsible use.
