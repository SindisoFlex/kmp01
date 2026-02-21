import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Users,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Bell,
  MessageSquareMore,
  PlusCircle,
  MailPlus
} from "lucide-react";
import { useAdminMessages } from "@/hooks/useAdminMessages";
import { Skeleton } from "@/components/ui/skeleton";

// Mocks removed

const MessagingSystem: React.FC = () => {
  const { conversations: initialConversations, isLoading, recipients: staffAndClients, sendMessage: sendBackendMessage } = useAdminMessages();

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Sync state when data loads
  React.useEffect(() => {
    if (initialConversations) {
      setConversations(initialConversations);
    }
  }, [initialConversations]);

  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyByWhatsApp, setNotifyByWhatsApp] = useState(false);

  // Filter conversations based on active tab and search query
  const getFilteredConversations = () => {
    let filtered = [...conversations];

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    } else if (activeTab === "clients") {
      filtered = filtered.filter(conv =>
        conv.participants.some(p => p.role === "client")
      );
    } else if (activeTab === "staff") {
      filtered = filtered.filter(conv =>
        conv.participants.some(p => p.role === "staff")
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.participants.some(p =>
          p.name.toLowerCase().includes(query)
        ) ||
        conv.lastMessage.text.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    return filtered.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const filteredConversations = getFilteredConversations();

  // Get conversation partner name (non-admin)
  const getPartnerName = (conversation: any) => {
    const partner = conversation.participants.find(p => p.role !== "admin");
    return partner ? partner.name : "Unknown";
  };

  // Get conversation partner role
  const getPartnerRole = (conversation: any) => {
    const partner = conversation.participants.find(p => p.role !== "admin");
    return partner ? partner.role : "unknown";
  };

  // Get avatar letters
  const getAvatarLetters = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Select a conversation
  const selectConversation = (conversation: any) => {
    setActiveConversation(conversation);

    // Mark messages as read
    if (conversation.unreadCount > 0) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversation.id) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
      setConversations(updatedConversations);
    }
  };

  // Send a message in active conversation
  const sendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;

    try {
      await sendBackendMessage({ conversationId: activeConversation.id, text: messageText.trim() });

      const newMessage = {
        id: `msg-${activeConversation.id}-${Date.now()}`,
        conversationId: activeConversation.id,
        senderId: "admin-1",
        text: messageText.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };

      // Update local optimistically
      setMessages([...messages, newMessage]);

      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            lastMessage: newMessage,
            updatedAt: newMessage.timestamp
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setActiveConversation({
        ...activeConversation,
        lastMessage: newMessage,
        updatedAt: newMessage.timestamp
      });

      setMessageText("");

      toast({
        title: "Message Sent",
        description: `Message sent to ${getPartnerName(activeConversation)}.`,
      });
    } catch (e: any) {
      toast({ title: "Failed to send", description: "Backend might not be configured.", variant: "destructive" });
    }
  };

  // Create a new conversation/message
  const createNewMessage = () => {
    if (!newMessageRecipient || !newMessageText.trim()) return;

    const recipient = staffAndClients.find(person => person.id === newMessageRecipient);
    if (!recipient) return;

    // Create conversation ID
    const newConvId = `conv-${conversations.length + 1}`;

    // Create message
    const newMessage = {
      id: `msg-${newConvId}-1`,
      conversationId: newConvId,
      senderId: "admin-1",
      text: newMessageText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Create conversation
    const newConversation = {
      id: newConvId,
      participants: [
        { id: "admin-1", name: "Admin", role: "admin" },
        { id: recipient.id, name: recipient.name, role: recipient.role }
      ],
      lastMessage: newMessage,
      unreadCount: 0,
      updatedAt: newMessage.timestamp
    };

    // Update state
    setMessages([...messages, newMessage]);
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);

    // Reset form
    setNewMessageRecipient("");
    setNewMessageText("");
    setIsNewMessageOpen(false);

    const notificationMethods = [];
    if (notifyByEmail) notificationMethods.push("email");
    if (notifyByWhatsApp) notificationMethods.push("WhatsApp");

    const notificationText = notificationMethods.length > 0
      ? ` Notification sent via ${notificationMethods.join(" and ")}.`
      : "";

    toast({
      title: "New Message Sent",
      description: `Message sent to ${recipient.name}.${notificationText}`,
    });
  };

  // Format time for display
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for conversation list
  const formatConversationDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise show date
    return date.toLocaleDateString();
  };

  // Get messages for active conversation
  const getConversationMessages = () => {
    if (!activeConversation) return [];
    return messages.filter(msg => msg.conversationId === activeConversation.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messaging</h1>
          <p className="text-muted-foreground">Communicate with clients and staff</p>
        </div>

        <Button onClick={() => setIsNewMessageOpen(true)}>
          <MessageSquareMore className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Card className="card-dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          <div className="border-r">
            <CardHeader className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Conversations</CardTitle>
                  <Badge>{conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <div className="h-[calc(600px-140px)] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 border-b flex items-start gap-3 cursor-pointer ${activeConversation?.id === conversation.id
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                    }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <Avatar>
                    <AvatarFallback>
                      {getAvatarLetters(getPartnerName(conversation))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{getPartnerName(conversation)}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatConversationDate(conversation.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {getPartnerRole(conversation)}
                      </Badge>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No conversations match your search."
                      : activeTab === "unread"
                        ? "No unread messages."
                        : "No conversations found."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {getAvatarLetters(getPartnerName(activeConversation))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{getPartnerName(activeConversation)}</CardTitle>
                        <CardDescription>{getPartnerRole(activeConversation)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {getConversationMessages().map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === "admin-1" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${msg.senderId === "admin-1"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                          }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-xs ${msg.senderId === "admin-1"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                            }`}>
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {msg.senderId === "admin-1" && (
                            msg.read ? (
                              <Check className="h-3 w-3 text-primary-foreground/70" />
                            ) : (
                              <Check className="h-3 w-3 text-primary-foreground/40" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Select a Conversation</h3>
                <p className="text-muted-foreground text-center mt-2 max-w-xs">
                  Choose a conversation from the list or start a new message.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsNewMessageOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Send a new message to a client or staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={newMessageRecipient}
                onValueChange={setNewMessageRecipient}
              >
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Clients & Staff</SelectLabel>
                    {staffAndClients.map((person: any) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} ({person.role})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={4}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message here"
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Options</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-email"
                  checked={notifyByEmail}
                  onCheckedChange={setNotifyByEmail}
                />
                <Label htmlFor="notify-email">Send email notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-whatsapp"
                  checked={notifyByWhatsApp}
                  onCheckedChange={setNotifyByWhatsApp}
                />
                <Label htmlFor="notify-whatsapp">Send WhatsApp notification</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewMessage} disabled={!newMessageRecipient || !newMessageText.trim()}>
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingSystem;
