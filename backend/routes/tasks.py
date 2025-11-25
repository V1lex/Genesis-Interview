from fastapi import APIRouter
from fastapi.responses import JSONResponse


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/next")
async def next_task(level: str = "junior"):
    """
    Возвращает следующую задачу и видимые тесты
    level: junior / middle / senior
    """
    tasks = {
        "junior": {
            "task_id": "junior_001",
            "title": "Сумма чётных чисел",
            "description": "Напиши функцию sum_even(numbers), которая возвращает сумму всех чётных чисел в списке.",
            "visible_tests": [
                {"input": [1, 2, 3, 4], "output": 6},
                {"input": [0, 0, 1], "output": 0},
            ],
        },
        "middle": {
            "task_id": "middle_001",
            "title": "Подстроки и частоты",
            "description": "Функция count_substrings(s, sub) должна считать количество вхождений подстроки.",
            "visible_tests": [
                {"input": ["banana", "an"], "output": 2},
                {"input": ["aaa", "aa"], "output": 2},
            ],
        },
    }

    if level not in tasks:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "TASK_LEVEL_NOT_FOUND",
                    "message": f"Level {level} not found",
                },
            },
        )

    return {"success": True, "task": tasks[level]}


@router.post("/run")
async def run_code(task_id: str, code: str):
    """
    Мок раннера на видимых тестах
    """
    results = [
        {"test": 1, "passed": True},
        {"test": 2, "passed": True},
    ]

    return {"success": True, "task_id": task_id, "results": results, "time_ms": 42}


@router.post("/check")
async def check_code(task_id: str, code: str):
    """
    Мок проверки кода на скрытых тестах
    """
    hidden_failed = True
    timeout = False
    limit_exceeded = False

    details = "Edge case: empty input caused failure"

    return {
        "success": not hidden_failed,
        "task_id": task_id,
        "hidden_failed": hidden_failed,
        "details": details,
        "timeout": timeout,
        "limit_exceeded": limit_exceeded
    }
