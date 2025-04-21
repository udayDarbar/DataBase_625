# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Sets the working directory in the docker container
WORKDIR /backend

# Copy the requirements file (the dependencies) to the container
COPY requirements.txt ./

# Installs packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install watchdog to improve reloading in Docker
RUN pip install watchdog

# Copy files
COPY . .

# Exposes port 5000 for Flask
EXPOSE 5000

# Use shell form to directly invoke the script
CMD ["/bin/sh", "-c", "python wait_for_mysql.py && flask --app src/app.py run --host=0.0.0.0 --debug"]