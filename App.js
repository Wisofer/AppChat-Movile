import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from "react-native";
import io from "socket.io-client";
import { EmojiPicker } from "react-native-emoji-picker";

const socket = io("/");

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("message", receiveMessage);

    return () => {
      socket.off("message", receiveMessage);
    };
  }, []);

  const receiveMessage = (message) => setMessages((state) => [...state, message]);

  const handleSubmit = () => {
    if (message.trim() === "") {
      return; // No enviar si el mensaje está vacío
    }
    const newMessage = {
      body: message,
      from: "Me",
    };
    setMessages((state) => [...state, newMessage]);
    setMessage("");
    socket.emit("message", newMessage.body);
    setShowEmojiPicker(false); // Ocultar el Emoji Picker solo al enviar el mensaje
  };

  const onEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 16 }}>
        wisoChat
      </Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.from === "Me" ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
            <View style={{
              backgroundColor: item.from === "Me" ? '#1E90FF' : '#4B0082',
              borderRadius: 10,
              padding: 10,
              maxWidth: '80%',
            }}>
              <Text style={{ color: 'white' }}>
                <Text style={{ fontWeight: 'bold' }}>{item.from === "Me" ? "Yo" : "Amigos"}: </Text>
                {item.body}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ref={messagesEndRef}
        onContentSizeChange={() => messagesEndRef.current.scrollToEnd({ animated: true })}
      />

      {showEmojiPicker && (
        <EmojiPicker onEmojiSelected={onEmojiClick} />
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#333',
            color: 'white',
            padding: 10,
            borderRadius: 5,
            marginRight: 8,
          }}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Text style={{ color: 'yellow', marginRight: 8 }}>😊</Text>
        </TouchableOpacity>
        <Button title="Enviar" onPress={handleSubmit} color="#1E90FF" />
      </View>
    </View>
  );
};

export default App;
