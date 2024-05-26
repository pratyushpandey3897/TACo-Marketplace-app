# Use the official Python image from the Docker Hub
FROM python:3.8-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script into the container
COPY model.py /app/

# Entrypoint to allow passing arguments
ENTRYPOINT ["python", "model.py"]
