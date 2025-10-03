# NutriAI - Asistente Nutricional Inteligente

![NutriAI Homepage](./images/NutriAI.png)

Un sistema integral para la gestión de necesidades dietéticas, búsqueda de restaurantes y recomendaciones nutricionales personalizadas para pacientes con diabetes en Cartagena, Colombia, potenciado por Inteligencia Artificial.

## 🤖 Tecnología IA

- Integración con GPT-4 para recomendaciones personalizadas
- Análisis inteligente de patrones alimenticios
- Sistema de recomendación basado en IA
- Asistente virtual nutricional
- Procesamiento de lenguaje natural para interacciones naturales

## 🚀 Características Principales

- Autenticación y gestión de perfiles de usuario
- Seguimiento de perfil médico para pacientes diabéticos
- Recomendaciones de restaurantes basadas en restricciones dietéticas
- Chat interactivo con IA para consejos nutricionales
- Alertas de monitoreo de glucosa en tiempo real
- Sistema de calificación y reseñas de restaurantes
- Mapa interactivo de restaurantes aptos para diabéticos

## 🏗️ Arquitectura Técnica

### Frontend (Next.js)
```tree
frontend/
├── app/                # Directorio Next.js 14
│   ├── admin/         # Panel de administración
│   ├── login/         # Autenticación
│   ├── maps/          # Ubicaciones de restaurantes
│   ├── profile/       # Gestión de perfil
│   └── restaurants/   # Listado de restaurantes
├── components/        # Componentes UI reutilizables
├── hooks/             # Hooks personalizados
├── lib/              # Funciones utilitarias
└── public/           # Activos estáticos
```

### Backend (FastAPI)
```tree
backend/
├── app/
│   ├── api/          # Endpoints de API
│   ├── core/         # Configuraciones principales
│   ├── crud/         # Operaciones de base de datos
│   ├── db/           # Configuración de base de datos
│   ├── models/       # Modelos SQLAlchemy
│   └── schemas/      # Esquemas Pydantic
```

### Servicio Asistente de Restaurantes
```tree
asistente_restaurante/
├── app.py           # Asistente de restaurantes con IA
└── requirements.txt # Dependencias Python
```

## 🔧 Configuración del Entorno

### Variables de Entorno Backend
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/nutriai
SECRET_KEY=tu-clave-secreta-aqui
AZURE_OPENAI_KEY=tu-clave-azure-openai
AZURE_OPENAI_ENDPOINT=tu-endpoint-azure
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=tu-jwt-secret
JWT_ALGORITHM=HS256
```

### Variables de Entorno Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPS_API_KEY=tu-google-maps-api-key
NEXT_PUBLIC_AI_ASSISTANT_URL=http://localhost:8001
```

### Variables de Entorno Asistente de Restaurantes
```env
OPENAI_API_KEY=tu-openai-api-key
MODEL_NAME=gpt-4-turbo
MAX_TOKENS=2048
```

## 🛠️ Configuración de Desarrollo

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker y Docker Compose

### Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/nutriai.git
cd nutriai
```

2. Configurar Backend:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configurar Frontend:
```bash
cd frontend
pnpm install
```

4. Configurar Asistente de Restaurantes:
```bash
cd asistente_restaurante
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Ejecución con Docker

```bash
docker-compose up -d
```

## 📝 Documentación de API

- API Backend: http://localhost:8000/docs
- API Asistente de Restaurantes: http://localhost:8001/docs

## 🔒 Características de Seguridad

- Autenticación basada en JWT
- Encriptación de contraseñas con bcrypt
- Protección CORS
- Limitación de tasa
- Validación de entrada

## 📦 Dependencias

### Frontend
- Next.js 14
- Tailwind CSS
- Shadcn UI
- React Query
- TypeScript

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Python-Jose
- Passlib

### Asistente de Restaurantes
- FastAPI
- Azure OpenAI
- Langchain

### Asistente de Restaurantes
- Azure Devops


## 👥 Cómo Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia y Uso

Este proyecto es **público** y de libre acceso en GitHub.  
Sin embargo, todo el código y contenido está protegido por **derechos de autor © 2025 [CHO]; LABS**.  

Queda prohibido el uso comercial, la redistribución o la modificación sin autorización previa del autor.  
Para solicitar permisos especiales, contáctanos.

## Contacto

Si tienes preguntas sobre este proyecto:

- Hernan Zuluaga – [hernandavid4224@outlook.com](mailto:hernandavid4224@outlook.com)
- Owen Tovar – [owentovar07@gmail.com](mailto:owentovar07@gmail.com)  

Repositorio: [https://github.com/HDZR24/NutriAI](https://github.com/HDZR24/NutriAI)

