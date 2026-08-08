# Overview
Image Analyzer is a web app that allows user to upload an image to perform image analysis using generative AI.

# Technology Stack
## Frontend
- React
- Tailwind CSS

## Backend
- Python 3.12
- FastAPI

## AI Services
- Azure OpenAI

# Prompt Design
The image analysis prompt should ensure the AI service returns following sections:
- Overall description
- Identified location
- Main objects identified in the image
- Texts observed in the image
- List of tags representing the image

# API Contract
The backend should expose POST APIs to support image analysis. Design request and response format according to the user story.

Use path: /api

# Image Processing Pipeline
No image processing is required.

# Data Lifecycle and Retention
- No data persistence, storage, retention requirement

# Configuration
Use env file for local testing. Following values will be stored in the env file:
- Azure OpenAI endpoint
- Model deployment name

# Authentication
- No user authentication is required.
- User accesses the frontend using http URL.
- Backend calls Azure OpenAI using the default Azure credential. Managed Identity will configured on the infrastructure.

# Security Controls
- Support HTTP endpoint
- No other security control is required

# Privacy and Compliance
Not required

# Non-Functional Requirements
Not required

# Observability
- Error on stdout
- Logging of main steps on stdout

# Testing Strategy
Not required

# Deployment Environment
This web app will be deployed as container on Azure Container Apps or Azure Kubernetes. A Dockerfile should be created with complete dependency.