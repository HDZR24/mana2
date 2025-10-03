import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AzureOpenAI
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar cliente de Azure OpenAI
client = AzureOpenAI(
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY")
)
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT")

# Inicializar FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Esquema de entrada
class ChatInput(BaseModel):
    user_id: int
    message: str

# Conexión a la base de datos
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )

# Obtener información del usuario
def get_user_info(user_id: int):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return user

# Palabras clave fuera de contexto (opcional)
PROHIBITED_KEYWORDS = ["python", "java", "programa", "algoritmo", "script", "modelo", "código", "machine learning", "deportes", "clima", "noticias"]

# Filtrar platos según condiciones del usuario
def filtrar_platos_para_usuario(platos, condiciones_usuario):
    relevantes = []
    for p in platos:
        beneficios = " ".join([
            (p.get("category") or "").lower(),
            (p.get("subcategory") or "").lower()
        ])
        if all(cond.lower() in beneficios for cond in condiciones_usuario):
            relevantes.append(p)
    return relevantes

# Obtener informacion de restaurantes
def get_restaurantes_para_usuario(condiciones_usuario):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM restaurant")
            restaurantes = cur.fetchall()            

            restaurante_info = "\n".join([
                f"Restaurante: {p['name']}\n"
                f"Ubicacion: {p['location']}\n"
                f"Puntuacion: {p['rating']}\n"                
                f"Descripcion: {p['description']}\n"                
                for p in restaurantes
            ])
            return restaurante_info


# Obtener menú personalizado
def get_menu_para_usuario(condiciones_usuario):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM dishes WHERE is_active = TRUE")
            platos = cur.fetchall()
            platos_filtrados = filtrar_platos_para_usuario(platos, condiciones_usuario)

            menu_texto = "\n".join([
                f"{p['name']} ({p['price_cop']} COP) - Restaurante: {p['restaurant']}\n"
                f"Descripción: {p['description']}\n"
                f"Ingredientes: {p['ingredients']}\n"                
                f"Beneficios: {p['health_benefits']}\n"
                #f"Control de: {p['category']}\n"
                for p in platos_filtrados
            ])
            return menu_texto or "No hay platos disponibles que se ajusten a tus condiciones médicas." 

# Endpoint del chatbot
@app.post("/chat")
async def chat_endpoint(payload: ChatInput):
    user_id = payload.user_id
    user_input = payload.message.strip()

    # Filtro simple para evitar temas fuera de contexto
    if any(word in user_input.lower() for word in PROHIBITED_KEYWORDS):
        return {"response": "Lo siento, solo puedo ayudarte con recomendaciones de alimentación saludable."}

    user_info = get_user_info(user_id)

    condiciones = []
    if user_info["hypertension"]:
        condiciones.append("hipertensión")
    if user_info["obesity"]:
        condiciones.append("obesidad")
    if user_info["diabetes"]:
        condiciones.append("diabetes")

    condiciones_str = ", ".join(condiciones) if condiciones else "ninguna condición específica"
    menu_texto = get_menu_para_usuario(condiciones)
    restaurante_info = get_restaurantes_para_usuario(condiciones)

    # Instrucción al sistema
    system_prompt = {
    "role": "system",
    "content": f"""
Eres MarIA, una asistente experta en alimentación saludable.

Estás conversando con {user_info['full_name']}, quien tiene las siguientes condiciones médicas: {condiciones_str}.

Tu tarea es ayudarle a elegir platos adecuados para su salud, *sin dar toda la información de una sola vez*. En esta primera interacción, solo debes sugerir entre 2 y 4 platos, mencionando brevemente por qué podrían ser adecuados. No menciones los ingredientes completos ni el restaurante aún.

Este es el menú disponible: {menu_texto}
Este es el listado de restaurantes: {restaurante_info}


Después de hacer las recomendaciones, *pregunta al usuario si desea saber más detalles sobre alguno de esos platos* (por ejemplo: ingredientes, beneficios específicos o en qué restaurante se encuentran).

Si el usuario menciona un plato, entonces sí puedes dar más detalles, incluyendo el restaurante y la ubicación. Si pregunta por el restaurante, entonces puedes describirlo.

Nunca respondas preguntas fuera del contexto de alimentación saludable o del menú disponible.

Sé clara, amable y breve en tus respuestas. Recuerda siempre guiar la conversación paso a paso.

(Usa maximo 190 tokens para cada una de tus respuestas)
"""
}

    # Historial de la conversación
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT role, content
                FROM chat_messages
                WHERE user_id = %s
                ORDER BY timestamp DESC
                LIMIT 10
            """, (user_id,))
            history = cur.fetchall()

    # Construir mensajes para el modelo
    messages = [system_prompt]
    for msg in reversed(history):
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_input})

    try:
        # Llamar al modelo de Azure OpenAI
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=messages,
            temperature=0.3,
            max_tokens=200
        )
        assistant_reply = response.choices[0].message.content

        # Guardar conversación en la base de datos
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO chat_messages (user_id, role, content)
                    VALUES (%s, %s, %s)
                """, (user_id, "user", user_input))
                cur.execute("""
                    INSERT INTO chat_messages (user_id, role, content)
                    VALUES (%s, %s, %s)
                """, (user_id, "assistant", assistant_reply))
                conn.commit()

        return {"response": assistant_reply}

    except Exception as e:
        return {"error": str(e)}
