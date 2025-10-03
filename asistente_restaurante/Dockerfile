FROM python:3.11-slim

WORKDIR /app

COPY asistente_restaurante/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY asistente_restaurante .

CMD ["uvicorn", "asistente_restaurante.app:app", "--host", "0.0.0.0", "--port", "8001"]