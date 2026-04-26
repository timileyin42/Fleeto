from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, job_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[job_id].append(ws)

    def disconnect(self, job_id: str, ws: WebSocket) -> None:
        conns = self._connections.get(job_id, [])
        if ws in conns:
            conns.remove(ws)

    async def broadcast(self, job_id: str, data: dict) -> None:
        for ws in list(self._connections.get(job_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass


ws_manager = ConnectionManager()
