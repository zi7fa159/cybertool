# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install only production dependencies
# Using npm ci is generally recommended if you have a package-lock.json
RUN npm ci --only=production

# Bundle app source
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define the command to run the app
# Using "npm start" if you have it defined in package.json scripts to run nodemon (for dev) or node index.js (for prod)
# For production, directly running node is often preferred.
# Ensure your package.json's "start" script is "node index.js" for this to work as a production image.
# Or, directly use: CMD [ "node", "index.js" ]
# For this project, we have "start": "nodemon index.js" which is for development.
# So, we should use CMD ["node", "index.js"] directly for production.
CMD [ "node", "index.js" ]
