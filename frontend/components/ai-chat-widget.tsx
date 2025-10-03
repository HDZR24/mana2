"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  X,
  Send,
  Bot,
  Heart,
  Utensils,
  Activity,
  MapPin,
  Sparkles,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  suggestions?: string[]
}

interface UserProfile {
  id: number
  email: string
  full_name: string
  age: number
  gender: string
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string
  is_active: boolean
}

interface ChatResponse {
  response?: string
  error?: string
}

interface ChatState {
  messages: Message[]
  isOpen: boolean
  isMinimized: boolean
  hasWelcomeMessage: boolean
}

// Global chat state manager
class ChatStateManager {
  private static instance: ChatStateManager
  private chatStates: Map<number, ChatState> = new Map()

  static getInstance(): ChatStateManager {
    if (!ChatStateManager.instance) {
      ChatStateManager.instance = new ChatStateManager()
    }
    return ChatStateManager.instance
  }

  saveChatState(userId: number, state: Partial<ChatState>) {
    const currentState = this.getChatState(userId)
    const newState = { ...currentState, ...state }
    this.chatStates.set(userId, newState)

    // Also save to localStorage for persistence across browser sessions
    try {
      const stateToSave = {
        ...newState,
        messages: newState.messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
      }
      localStorage.setItem(`maria_chat_${userId}`, JSON.stringify(stateToSave))
      console.log(`💾 Chat state saved for user ${userId}:`, newState)
    } catch (e) {
      console.error("Error saving chat state to localStorage:", e)
    }
  }

  getChatState(userId: number): ChatState {
    // First check in-memory state
    if (this.chatStates.has(userId)) {
      console.log(`📖 Loading chat state from memory for user ${userId}`)
      return this.chatStates.get(userId)!
    }

    // Then check localStorage
    try {
      const saved = localStorage.getItem(`maria_chat_${userId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        if (parsed.messages) {
          parsed.messages = parsed.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        }
        console.log(`📖 Loading chat state from localStorage for user ${userId}:`, parsed)
        this.chatStates.set(userId, parsed)
        return parsed
      }
    } catch (e) {
      console.error("Error loading chat state from localStorage:", e)
    }

    // Return default state
    const defaultState = {
      messages: [],
      isOpen: false,
      isMinimized: false,
      hasWelcomeMessage: false,
    }
    console.log(`📖 Using default chat state for user ${userId}`)
    return defaultState
  }

  clearChatState(userId: number) {
    this.chatStates.delete(userId)
    localStorage.removeItem(`maria_chat_${userId}`)
    console.log(`🗑️ Chat state cleared for user ${userId}`)
  }
}

// Markdown parsing function
const parseMarkdown = (text: string) => {
  // Convert **bold** to <strong>bold</strong>
  let parsed = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convert *italic* to <em>italic</em>
  parsed = parsed.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Convert numbered lists (1. item) to proper list items
  parsed = parsed.replace(/^(\d+)\.\s+\*\*(.*?)\*\*/gm, '<div class="list-item"><strong>$1. $2</strong></div>')
  parsed = parsed.replace(/^(\d+)\.\s+(.*?)$/gm, '<div class="list-item"><strong>$1.</strong> $2</div>')

  return parsed
}

// Component to render markdown text
const MarkdownText = ({ text }: { text: string }) => {
  const parsedText = parseMarkdown(text)

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: parsedText }}
      style={{
        lineHeight: "1.5",
      }}
    />
  )
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const chatManager = ChatStateManager.getInstance()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Load user and initialize chat state
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      console.log("🔍 Checking authentication...")
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("❌ No token found")
        setUser(null)
        setIsLoadingUser(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const userData = await response.json()
          console.log("✅ User authenticated:", userData.full_name)
          setUser(userData)

          // Load saved chat state immediately after user is set
          const savedState = chatManager.getChatState(userData.id)
          console.log("📋 Loaded chat state:", savedState)

          setMessages(savedState.messages)
          setIsOpen(savedState.isOpen)
          setIsMinimized(savedState.isMinimized)

          // Create welcome message if this is the first time
          if (!savedState.hasWelcomeMessage && savedState.messages.length === 0) {
            console.log("👋 Creating welcome message...")
            const conditions = []
            if (userData.diabetes) conditions.push("diabetes")
            if (userData.hypertension) conditions.push("hipertensión")
            if (userData.obesity) conditions.push("obesidad")

            const conditionsText =
              conditions.length > 0
                ? ` Veo que tienes ${conditions.join(", ")}, así que te ayudaré con recomendaciones personalizadas para tu salud.`
                : " Te ayudaré con recomendaciones de alimentación saludable."

            const welcomeMessage: Message = {
              id: "welcome",
              text: `¡Hola ${userData.full_name}! 👋\n\nSoy MarIA, tu asistente de alimentación saludable de MANA2.${conditionsText}\n\n¿En qué puedo ayudarte hoy?`,
              isBot: true,
              timestamp: new Date(),
              suggestions: [
                "¿Qué platos me recomiendas?",
                "Buscar opciones saludables",
                "Información nutricional",
                "Restaurantes recomendados",
              ],
            }

            setMessages([welcomeMessage])
            chatManager.saveChatState(userData.id, {
              messages: [welcomeMessage],
              hasWelcomeMessage: true,
            })
          }

          setIsInitialized(true)
        } else if (response.status === 401) {
          console.log("🔒 Token expired")
          localStorage.removeItem("access_token")
          localStorage.removeItem("token_type")
          setUser(null)
        } else {
          console.log("❌ Authentication failed")
          setUser(null)
        }
      } catch (err) {
        console.error("❌ Error loading user:", err)
        setUser(null)
      } finally {
        setIsLoadingUser(false)
      }
    }

    if (!isInitialized) {
      checkAuthAndLoadUser()
    }
  }, [isInitialized, chatManager])

  // Save state changes to persistent storage
  useEffect(() => {
    if (user && isInitialized) {
      console.log("💾 Saving chat state changes...")
      chatManager.saveChatState(user.id, {
        messages,
        isOpen,
        isMinimized,
      })
    }
  }, [messages, isOpen, isMinimized, user, isInitialized, chatManager])

  // Listen for authentication events
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log("🔄 User logged in event received")
      setIsInitialized(false)
      setIsLoadingUser(true)
    }

    const handleUserLoggedOut = () => {
      console.log("🔄 User logged out event received")
      if (user) {
        chatManager.clearChatState(user.id)
      }
      setUser(null)
      setMessages([])
      setIsOpen(false)
      setIsMinimized(false)
      setIsLoadingUser(false)
      setIsInitialized(false)
    }

    window.addEventListener("userLoggedIn", handleUserLoggedIn)
    window.addEventListener("userLoggedOut", handleUserLoggedOut)

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn)
      window.removeEventListener("userLoggedOut", handleUserLoggedOut)
    }
  }, [user, chatManager])

  const quickActions = [
    {
      icon: Activity,
      text: "¿Qué platos me recomiendas para mi condición?",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
    {
      icon: Heart,
      text: "Opciones bajas en sodio",
      color: "bg-red-100 text-red-700 hover:bg-red-200",
    },
    {
      icon: Utensils,
      text: "Platos bajos en calorías",
      color: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    {
      icon: MapPin,
      text: "¿Qué restaurantes me recomiendas?",
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    },
  ]

  const sendMessageToAPI = async (messageText: string) => {
    if (!user) {
      setError("Debes iniciar sesión para usar el asistente de alimentación")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("📤 Sending message to API:", messageText)
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_CHAT_BASE_URL}${process.env.NEXT_PUBLIC_API_CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          message: messageText,
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Usuario no encontrado en la base de datos")
        }
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data: ChatResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.response) {
        console.log("📥 Received API response:", data.response)
        const botResponse: Message = {
          id: Date.now().toString(),
          text: data.response,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Más opciones", "Información nutricional", "Otros platos"],
        }
        setMessages((prev) => [...prev, botResponse])
      }
    } catch (err) {
      console.error("❌ Error sending message:", err)
      setError(err instanceof Error ? err.message : "Error de conexión con el asistente")

      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente.",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    console.log("💬 User sending message:", message)
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = message
    setMessage("")

    await sendMessageToAPI(messageToSend)
  }

  const handleQuickAction = async (action: string) => {
    console.log("⚡ Quick action:", action)
    const userMessage: Message = {
      id: Date.now().toString(),
      text: action,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    await sendMessageToAPI(action)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleQuickAction(suggestion)
  }

  // Don't show widget if still loading user data
  if (isLoadingUser) {
    return null
  }

  // Don't show widget if user is not authenticated
  if (!user) {
    return null // Chat widget only available for authenticated users
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
        >
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
          <div className="absolute inset-2 rounded-full bg-green-300 animate-pulse opacity-30"></div>

          {/* Bot icon with sparkles */}
          <div className="relative">
            <Bot className="h-8 w-8 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-bounce" />
          </div>

          {/* Notification badge - show if there are messages */}
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{messages.length}</span>
            </div>
          )}
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">¡Hola! Soy MarIA</p>
              <p className="text-xs text-gray-600">Tu asistente nutricional IA</p>
              {messages.length > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  {messages.length} mensaje{messages.length !== 1 ? "s" : ""} guardado{messages.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`w-96 sm:w-full max-w-sm md:max-w-md lg:max-w-lg bg-white/95 backdrop-blur-lg shadow-2xl border-0 transition-all duration-300 ${
          isMinimized ? "h-16" : "h-[600px]"
        }`}
      >
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                {/* Animated sparkles around the bot */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-3 w-3 text-yellow-300 animate-bounce" />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold">MarIA</CardTitle>
                <p className="text-sm text-green-100">Asistente Nutricional IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            {/* Error Alert */}
            {error && (
              <div className="p-4 border-b border-gray-100">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        msg.isBot
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-gray-800 border border-green-100"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      }`}
                    >
                      {msg.isBot && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-600">MarIA</span>
                        </div>
                      )}
                      {msg.isBot ? (
                        <MarkdownText text={msg.text} />
                      ) : (
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      )}
                      {msg.suggestions && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs border-green-200 text-green-700 hover:bg-green-50 mr-2 mb-1"
                              disabled={isLoading}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-gray-800 border border-green-100 rounded-2xl p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bot className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Analizando tu consulta...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>


            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pregúntame sobre alimentación saludable..."
                  className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-4"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* CSS for markdown styling */}
      <style jsx>{`
        .markdown-content .list-item {
          margin: 8px 0;
          padding-left: 8px;
        }
        .markdown-content strong {
          font-weight: 600;
          color: #059669;
        }
        .markdown-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
