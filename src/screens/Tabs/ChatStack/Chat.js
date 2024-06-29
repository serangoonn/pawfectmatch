import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { firestore } from '../../../utils/firebase';

export default function ChatPage({ route }) {
  const chatPartner = route.params.profile;
  useEffect(() => {
    console.log('Chat partner:', chatPartner);
  }, [chatPartner]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);


  // get current username
  const auth = getAuth();
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    const chatDocId = [username, chatPartner].sort().join('_');
    const chatRef = collection(firestore, 'messages', chatDocId, 'chat');
    const q = query(chatRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatPartner, username]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
  
    const chatDocId = [username, chatPartner].sort().join('_');
  
    try {
        const docRef = await addDoc(collection(firestore, 'messages', chatDocId, 'chat'), {
            text: newMessage,
            sender: username, // Ensure this is correct
            timestamp: new Date(),
        });
          
  
      console.log('Message sent successfully with ID:', docRef.id);
  
      setNewMessage(''); // Clear input field after sending message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === username ? styles.username : styles.otherUser]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  username: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C5',
  },
  otherUser: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
