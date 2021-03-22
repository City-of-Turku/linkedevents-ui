# Use the official image as a parent image.
FROM node:14-alpine

RUN apk --no-cache add git

# Set the working directory.
WORKDIR /src

# Install app dependencies
COPY package.json .

# Run the command inside your image filesystem.
RUN yarn --silent

# Add metadata to the image to describe which port the container is listening on at runtime.
EXPOSE 8080

# Run the specified command within the container.
CMD ["yarn", "start"]

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .