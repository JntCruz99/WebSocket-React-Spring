import React, { useState, useEffect } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import {
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from '@mui/material';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    console.log("Attempting to connect to server...");
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("Connected to server successfully!");
      setStompClient(client);

      client.subscribe('/topic/messages', (message) => {
        console.log(">>> SUBSCRIBE");
        console.log(message);
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    }, (error) => {
      console.error("Error connecting to server:", error);
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
        console.log("Disconnected from server");
      }
    };
  }, [stompClient]);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = (event) => {
    event.preventDefault(); 

    if (message.trim()) {
      const chatMessage = {
        nickname,
        content: message,
      };

      stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
      setMessage('');
    }
  };

  return (
    <div>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>{msg.nickname.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1">{msg.nickname}</Typography>
              }
              secondary={msg.content}
            />
          </ListItem>
        ))}
      </List>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Seu nickname"
          value={nickname}
          onChange={handleNicknameChange}
          autoFocus
        />
        <TextField
          placeholder="Sua mensagem"
          value={message}
          onChange={handleMessageChange}
          fullWidth
        />
        <IconButton onClick={(event) => sendMessage(event)} disabled={!message.trim()}>
          send
        </IconButton>
      </div>
    </div>
  );
}

export default App;
