from fastapi import Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.routing import APIRouter
from openai import OpenAI
import asyncio
import json

from schemas.user_message import UserMessageSchema
from config import BASE_URL
from prompts import SYSTEM_SETTING_INTERVIEWER
from dependencies import verify_access_token


router = APIRouter(prefix="/chat", tags=["Chat"])

client = OpenAI(base_url=BASE_URL)


@router.post("/stream")
async def chat_stream(request: Request, user_message: UserMessageSchema, is_token_valid=Depends(verify_access_token)):

    print(is_token_valid)
    if not is_token_valid:
        raise HTTPException(status_code=401, detail="Access token not found or invalid or expired")

    async def event_generator():
        try:
            # Event: tyoing
            yield "event: typing\ndata: {}\n\n"

            stream = client.chat.completions.create(
                model="qwen3-32b-awq",
                messages=[
                    {"role": "system", "content": SYSTEM_SETTING_INTERVIEWER},
                    {"role": "user", "content": user_message.message},
                ],
                stream=True,
            )

            final_text = ""

            for chunk in stream:
                if await request.is_disconnected():
                    break

                delta = chunk.choices[0].delta.content
                if delta:
                    final_text += delta
                    payload = json.dumps({"delta": delta}, ensure_ascii=False)
                    # Event: delta
                    yield f"event: delta\ndata: {payload}\n\n"

                await asyncio.sleep(0)

            event = json.dumps({"final": final_text}, ensure_ascii=False)
            # Event: final
            yield f"event: final\ndata: {event}\n\n"

        except Exception as e:
            error_payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            # Event: error
            yield f"event: error\ndata: {error_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
