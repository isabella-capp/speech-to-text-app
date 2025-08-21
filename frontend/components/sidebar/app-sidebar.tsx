"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  User,
  Settings,
  MessageSquare,
  AudioWaveformIcon as Waveform,
  Trash2,
  AudioLines,
  LogOut,
} from "lucide-react"
import type { TranscriptionChat } from "@/types/transcription"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/auth-actions"
import { useSession } from "next-auth/react"
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu"
import { redirect } from "next/navigation"

interface AppSidebarProps {
  sessions: TranscriptionChat[]
  onDeleteSession: (sessionId: string) => void
  onClearAllSessions: () => void
  onNewSession: () => void
  isGuest?: boolean
}

export function AppSidebar({ sessions, onDeleteSession, onClearAllSessions, onNewSession }: AppSidebarProps) {
  const session = useSession()

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showTriggerOnHover, setShowTriggerOnHover] = useState(false)

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-none">
        <div className="flex flex-row justify-between items-center gap-2 mb-6 p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-2">
            <div
              className="relative"
              onMouseEnter={() => setShowTriggerOnHover(true)}
              onMouseLeave={() => setShowTriggerOnHover(false)}
            >
              {isCollapsed && showTriggerOnHover ? (
                <div className="w-8 h-8">
                  <div className="w-4 h-4 p-1 bg-[#f0f2f4]/50 rounded-lg">
                    <SidebarTrigger
                      onClick={() => setIsCollapsed(!isCollapsed)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
                  <Waveform className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
              SpeechGPT
            </span>
          </div>

          {/* SidebarTrigger visibile solo se sidebar NON collassata */}
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
          />

        </div>

        <Button
          className={cn(
            "bg-transparent shadow-white text-black hover:bg-[#f0f2f4]/50",
            "group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8",
            "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center",
            "group-data-[collapsible=icon]:rounded-lg",
            "w-full justify-start gap-2 p-5"
          )}
          onClick={onNewSession}
          title="Nuova Trascrizione"
        >
          <AudioLines className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
          <span className="group-data-[collapsible=icon]:hidden">Nuova Trascrizione</span>
        </Button>

        <Button
          className={cn(
            "bg-transparent shadow-white text-black hover:bg-[#f0f2f4]/50",
            "group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8",
            "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center",
            "group-data-[collapsible=icon]:rounded-lg",
            "w-full justify-start gap-2 p-5"
          )}
          onClick={() => setShowSearchDialog(true)}
          title="Cerca trascrizioni"
        >
          <Search className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
          <span className="group-data-[collapsible=icon]:hidden">Cerca trascrizioni</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4 group-data-[collapsible=icon]:p-0">
        <div className="mb-4 text-[#758697] font-medium group-data-[collapsible=icon]:hidden">Trascrizioni</div>
        <ScrollArea className="flex-1 ">
          <SidebarMenu>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 group-data-[collapsible=icon]:hidden">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna trascrizione</p>
              </div>
            ) : (
              sessions.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <div className="group flex items-center w-full mb-2">
                    <SidebarMenuButton
                      className="flex-1 justify-start group-data-[collapsible=icon]:hidden py-5 hover:bg-[#f0f2f4]/60"
                      onClick={() => redirect(chat.id)}
                      title={chat.title}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{chat.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {chat?.timestamp?.toLocaleDateString("it-IT")}
                        </div>
                      </div>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDeleteSession(chat.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 group-data-[collapsible=icon]:p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8",
                "group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center",
                "group-data-[collapsible=icon]:rounded-lg",
                "w-full justify-start gap-3 p-5"
              )}
              title="Menu utente"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-black flex items-center justify-center">
                {session?.data?.user?.image ? (
                  <img
                    src={session.data.user.image}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-white" />
                )}
              </div>

              <span className="group-data-[collapsible=icon]:hidden">{session?.data?.user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="flex flex-row items-center gap-2 px-2 py-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 truncate">
                {session?.data?.user?.email || "Non disponibile"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </DropdownMenuItem>
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Pulisci cronologia
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare tutta la cronologia? Questa azione non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearAllSessions} className="bg-red-600 hover:bg-red-700">
                      Elimina tutto
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logoutAction} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      {/* Dialog di ricerca */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="sr-only">Cerca trascrizioni</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campo di ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base py-3 border-0 bg-gray-50 focus-visible:ring-1"
                autoFocus
              />
            </div>

            {/* Pulsante Nuova Chat */}
            <Button
              onClick={() => {
                onNewSession()
                setShowSearchDialog(false)
              }}
              variant="ghost"
              className="w-full justify-start gap-3 p-4 h-auto bg-gray-50 hover:bg-gray-100"
            >
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">Nuova chat</span>
            </Button>

            {/* Risultati di ricerca */}
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {searchQuery && (
                  <>
                    <div className="text-sm font-medium text-gray-500 px-2">Oggi</div>
                    {filteredSessions
                      .filter((session) => {
                        const today = new Date()
                        const sessionDate = new Date(session.timestamp)
                        return sessionDate.toDateString() === today.toDateString()
                      })
                      .map((session) => (
                        <Button
                          key={session.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 h-auto hover:bg-gray-50"
                          onClick={() => {
                            // Logica per selezionare la chat
                            setShowSearchDialog(false)
                          }}
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="truncate font-medium text-sm">{session.title}</div>
                          </div>
                        </Button>
                      ))}

                    <div className="text-sm font-medium text-gray-500 px-2 mt-6">Ultimi 7 giorni</div>
                    {filteredSessions
                      .filter((session) => {
                        const today = new Date()
                        const sessionDate = new Date(session.timestamp)
                        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
                        return daysDiff > 0 && daysDiff <= 7
                      })
                      .map((session) => (
                        <Button
                          key={session.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 h-auto hover:bg-gray-50"
                          onClick={() => {
                            // Logica per selezionare la chat
                            setShowSearchDialog(false)
                          }}
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="truncate font-medium text-sm">{session.title}</div>
                          </div>
                        </Button>
                      ))}
                  </>
                )}

                {!searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inizia a digitare per cercare</p>
                  </div>
                )}

                {searchQuery && filteredSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessun risultato trovato</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
