# Upload image

User opens a modern, professional web page.

User clicks a button on the web page to upload an image, and gets a pop-up window to select an image file from the local machine.

After the image file has been uploaded, the web page displays the image. The image display area should have a fixed size with 16:9 aspect ratio. The image should be fit into the display area while keeping the original aspect ratio. Use scrollbars in the image display area when necessary.

There should be a button below the image display area to perform image analysis.

## Upload Constraints
- Supported image formats: jpg, png
- Maximum file size: 10 MB
- No other constraints

## Error Handling
- Display a clear error message for any constraint violation and other errors.
- No retry

# Analyze image

User clicks the image analysis button.

The web app sends the image to the Azure OpenAI service to create a detailed description of the image.

The image description is a text blob and should be displayed below the image display area. Markdown format should be supported. Use scrollbars when necessary.

When the web page is waiting for the image analysis result, it should display a spinner and user is not allowed to upload another image or click any button. 

## Error Handling
- Display a clear error message for any error.
- No try

# Non-Functional User Expectations
Not required

# Accessibility Requirement
Not required

# Acceptance Criteria
Not required
