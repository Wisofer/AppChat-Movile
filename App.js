import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("message", receiveMessage);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("message", receiveMessage);
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  const receiveMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...message, createdAt: new Date() },
    ]);
  };

  const handleSubmit = () => {
    if (message.trim() === "") {
      return;
    }
    const newMessage = {
      body: message,
      from: "Me",
      createdAt: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    socket.emit("message", newMessage.body);
    socket.emit("stop typing");
  };

  const handleChangeText = (text) => {
    setMessage(text);
    socket.emit("typing");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-900"
    >
      <View className="flex-1 p-4">
        <View className="bg-gray-800 p-4 rounded-lg mb-4">
          <Text className="text-2xl font-bold text-white text-center">
            wisoChat
          </Text>
        </View>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View className={`mb-4 ${item.from === "Me" ? "self-end" : "self-start"}`}>
              <View
                className={`p-4 rounded-lg max-w-4/5 ${item.from === "Me" ? "bg-blue-500" : "bg-purple-700"}`}
              >
                <Text className="font-bold text-white">
                  {item.from === "Me" ? "Yo" : "Amigos"}:
                </Text>
                <Text className="text-white">{item.body}</Text>
                <Text className="text-xs text-gray-400 text-right">
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ref={messagesEndRef}
          onContentSizeChange={() => messagesEndRef.current.scrollToEnd({ animated: true })}
        />
        {isTyping && (
          <Text className="text-xs italic text-gray-400 mb-2">
            Amigos está escribiendo...
          </Text>
        )}
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-700 text-white p-3 rounded-full mr-2"
            value={message}
            onChangeText={handleChangeText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 p-3 rounded-full">
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default App;
