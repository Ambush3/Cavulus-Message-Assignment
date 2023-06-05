# Cavulus-Message-Assignment

Small messaging app using Vue/Vuetify, JavaScript, and Firebase. 

The app consists of a Client Side, and an Admin Side. 
Through the client side you can register/login. Afterwards a chat window will appear, where you can then message the admin. 
Which currently is set for testing purposes and anyone can login to go back and forth and chat between themselves.


# Some of the features: 
1. User Authentication: The application allows only the administrative account to be able to access the conversation. 
2. One-on-One Messaging: Users can send private messages to an admin. These messages are displayed in a threaded conversation format, sorted by date and time. 
3. Search/Filter Messages: You can filter and search in the conversation texts for certain words in both admin and client chat 
4. Archive/Delete: You are able to delete conversations on the admin side. Firebase doesn’t have a way to archive however. Something I plan on working on in the future. 
5. Compatible with all devices

# Future enhancements: 
1. Better/more UI enhancements. 
2. Archive functionality and behavior. Being able to archive conversations, go to where all of the archived conversations are, and then decide from there if we want to delete permanently or not.  
3. Better notifications. Implementing a notification style where a sound chimes, and the current chat with the newest message, could change color to indicate a new unread message. 
