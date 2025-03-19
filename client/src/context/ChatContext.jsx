import { useCallback, useEffect, useState } from "react";
import { createContext } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/service";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [potentialChats, setPotentialChats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  console.log("userChats", userChats);
  console.log("currentChat", currentChat);
  console.log("messages", messages);
  console.log("messagesError", messagesError);
  console.log("onlineUsers", onlineUsers);
  console.log("sendTextMessageError", sendTextMessageError);
  console.log("notifications", notifications);

  // initialize socket
  useEffect(() => {
    const newSocket = io("https://socket-her6.onrender.com/");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // set online users
  useEffect(() => {
    if (socket === null) return;
    const userId = user?.uid; // ใช้ optional chaining ป้องกัน error
    if (!userId) return; 
    socket.emit("addNewUser", userId);
    socket.on("getUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getUsers");
    };
  }, [socket]);

  // send message
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members.find((id) => id !== user.uid);

    socket.emit("sendMessage", { ...newMessage, recipientId:recipientId });
  }, [newMessage]);

  // receive message and notifications
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?.chatid !== res.chatId) return;

      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members.some((Id) => Id === res.senderId);

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      if(!currentChat){
        return
      }

      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?.chatid}`
      );

      setIsMessagesLoading(false);

      if (response.error) {
        return setMessagesError(error);
      }

      setMessages(response);
    };
    getMessages();
  }, [currentChat]);

    useEffect(() => {
      const getUsers = async () => {
        const response = await getRequest(`${baseUrl}/auth`);
  
        if (response.error) {
          return console.log("Error fetching users:", response);
        }

        console.log(response);
  
        if (userChats) {
          const pChats = response?.filter((u) => {
            let isChatCreated = false;
  
            if (user.uid === u.uid) return false;
  
            isChatCreated = userChats?.some(
              (chat) => chat.members[0] === u.uid || chat.members[1] === u.uid
            );
  
            return !isChatCreated;
          });
  
          setPotentialChats(pChats);
        }
  
        setAllUsers(response);
      };
  
      getUsers();
    }, [userChats]);
  

  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatsLoading(true);
      setUserChatsError(null);

      if (!user) return;

      if (user.uid) {
        const userId = user.uid;

        const response = await getRequest(`${baseUrl}/chats/${userId}`);

        if (response.error) {
          return setUserChatsError(response);
        }
        console.log(response);

        setUserChats(response);
        
      }
      setIsUserChatsLoading(false);
    };

    getUserChats();
  }, [user, notifications]);

  const updateCurrentChat = useCallback(async (chat) => {
    setCurrentChat(chat);
  }, []);

  const sendTextMessage = useCallback(
  async (textMessage, sender, currentChatId, setTextMessage) => {
    if (!textMessage) return console.log("You must type something...");

    const response = await postRequest(`${baseUrl}/messages`, {
      chatId: currentChatId,
      senderId: sender,
      text: textMessage,
    });

    if (response.error) {
      return setSendTextMessageError(response);
    }

    setNewMessage(response);
    setMessages((prev) => [...prev, response[0]]);
    setTextMessage("");
  },
  [setMessages, setNewMessage]
);


  const markAllNotificationsAsRead = useCallback((notifications) => {
    const modifiedNotifications = notifications.map((n) => {
      return { ...n, isRead: true };
    });

    setNotifications(modifiedNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      // find chat to open
      const readChat = userChats.find((chat) => {
        const chatMembers = [user, n.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });

        return isDesiredChat;
      });

      // mark notification as read
      const modifiedNotifications = notifications.map((element) => {
        if (n.senderId === element.senderId) {
          return { ...n, isRead: true };
        } else {
          return element;
        }
      });

      updateCurrentChat(readChat);
      setNotifications(modifiedNotifications);
    },
    []
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      // mark notification as read

      const modifiedNotifications = notifications.map((element) => {
        let notification;

        thisUserNotifications.forEach((n) => {
          if (n.senderId === element.senderId) {
            notification = { ...n, isRead: true };
          } else {
            notification = element;
          }
        });

        return notification;
      });

      setNotifications(modifiedNotifications);
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        updateCurrentChat,
        currentChat,
        messages,
        messagesError,
        socket,
        sendTextMessage,
        onlineUsers,
        potentialChats,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
        newMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
