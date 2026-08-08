import base64
import logging

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self) -> None:
        self.scope = "https://ai.azure.com/.default"
        self.credential = DefaultAzureCredential()
        self.token_provider = get_bearer_token_provider(self.credential, self.scope)
        self._client = None
        self._client_key = None

    def _get_client(self) -> OpenAI:
        endpoint = settings.openai_endpoint
        client_key = (endpoint,)

        if self._client is None or self._client_key != client_key:
            self._client = OpenAI(
                base_url=endpoint,
                api_key=self.token_provider,
            )
            self._client_key = client_key

        return self._client

    def analyze_image(self, image_bytes: bytes, mime_type: str) -> str:
        if not settings.has_required_values:
            raise RuntimeError(
                "Missing configuration. Set OPENAI_ENDPOINT and MODEL_DEPLOYMENT_NAME."
            )

        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        prompt = (
            "Analyze this image and respond in markdown with exactly these sections: \n"
            "## Overall description\n"
            "## Identified location\n"
            "## Main objects identified in the image\n"
            "## Texts observed in the image\n"
            "## List of tags representing the image\n"
            "If a section cannot be confidently determined, write 'Unknown'."
        )

        client = self._get_client()
        deployment = settings.model_deployment_name

        try:
            response = client.responses.create(
                model=deployment,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": prompt},
                            {
                                "type": "input_image",
                                "image_url": f"data:{mime_type};base64,{image_b64}",
                            },
                        ],
                    }
                ],
                temperature=0.2,
                max_output_tokens=900,
            )
        except Exception as exc:
            logger.error("OpenAI SDK request failed: %s", exc)
            raise RuntimeError("OpenAI request failed.") from exc

        if hasattr(response, "model_dump_json"):
            logger.info("OpenAI raw response: %s", response.model_dump_json(indent=2))
        elif hasattr(response, "model_dump"):
            logger.info("OpenAI raw response: %s", response.model_dump())
        else:
            logger.info("OpenAI raw response: %r", response)

        output_text = getattr(response, "output_text", None)
        if isinstance(output_text, str) and output_text.strip():
            return output_text

        output_items = getattr(response, "output", []) or []
        for item in output_items:
            if getattr(item, "type", None) != "message":
                continue
            for content_item in getattr(item, "content", []) or []:
                content_type = getattr(content_item, "type", None)
                if content_type == "output_text":
                    text = getattr(content_item, "text", "")
                    if isinstance(text, str) and text.strip():
                        return text
                if content_type == "text":
                    text_field = getattr(content_item, "text", "")
                    if isinstance(text_field, str) and text_field.strip():
                        return text_field
                    value = getattr(text_field, "value", "")
                    if isinstance(value, str) and value.strip():
                        return value

        if hasattr(response, "model_dump"):
            data = response.model_dump()
            text = data.get("output_text", "")
            if isinstance(text, str) and text.strip():
                return text

        raise RuntimeError("OpenAI Responses API response did not contain text output.")


openai_service = OpenAIService()
