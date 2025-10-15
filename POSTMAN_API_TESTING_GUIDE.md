# 📡 Postman API Testing Guide for Chat Feature

## 🚀 Overview

This guide shows you how to test all the chat API endpoints using Postman. Make sure your development server is running on `http://localhost:3000` before testing.

## 📋 Prerequisites

1. **Start your development server**: `npm run dev`
2. **Open Postman** (or use Postman web version)
3. **Have a user account** created in your app (for userId)

---

## 🔗 API Endpoints to Test

### 1. 📥 **GET /api/chat** - Fetch Messages

**Purpose**: Retrieve recent chat messages

**Method**: `GET`  
**URL**: `http://localhost:3000/api/chat`

**Query Parameters**:
```
userId: your-user-id-here
limit: 50
```

**Full URL Example**:
```
http://localhost:3000/api/chat?userId=test-user-123&limit=10
```

**Expected Response**:
```json
{
  "messages": [
    {
      "id": "demo-1",
      "userId": "demo-user-1",
      "username": "CryptoTrader",
      "message": "Bitcoin looking strong today! 📈",
      "timestamp": 1703123456789,
      "isOwn": false
    }
  ]
}
```

---

### 2. 📤 **POST /api/chat** - Send Message

**Purpose**: Send a new chat message

**Method**: `POST`  
**URL**: `http://localhost:3000/api/chat`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "userId": "test-user-123",
  "username": "TestUser",
  "message": "Hello from Postman! This is a test message."
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": {
    "id": "1703123456789abc123",
    "userId": "test-user-123",
    "username": "TestUser",
    "message": "Hello from Postman! This is a test message.",
    "timestamp": 1703123456789
  }
}
```

---

### 3. 🔄 **GET /api/chat/sse** - Server-Sent Events (Real-time)

**Purpose**: Establish real-time connection for live updates

**Method**: `GET`  
**URL**: `http://localhost:3000/api/chat/sse`

**Query Parameters**:
```
userId: test-user-123
username: TestUser
```

**Full URL Example**:
```
http://localhost:3000/api/chat/sse?userId=test-user-123&username=TestUser
```

**Expected Response** (Stream):
```
data: {"type":"connected","data":{"clientId":"test-user-123-1703123456789-abc123"}}

data: {"type":"userCount","data":{"count":1}}

data: {"type":"heartbeat","data":{"timestamp":1703123456789}}
```

**Note**: This endpoint streams data continuously. In Postman, you'll see the response update in real-time.

---

### 4. 🌱 **POST /api/chat/seed** - Seed Demo Messages

**Purpose**: Add demo messages for testing (development only)

**Method**: `POST`  
**URL**: `http://localhost:3000/api/chat/seed`

**Headers**: None required

**Body**: None required

**Expected Response**:
```json
{
  "success": true,
  "message": "Demo messages seeded successfully",
  "count": 6
}
```

---

## 🧪 Step-by-Step Testing Instructions

### **Step 1: Test Message Fetching**

1. Open Postman
2. Create new request: `GET http://localhost:3000/api/chat?userId=test-user&limit=10`
3. Click **Send**
4. You should see demo messages in the response

### **Step 2: Test Message Sending**

1. Create new request: `POST http://localhost:3000/api/chat`
2. Set header: `Content-Type: application/json`
3. Add body:
   ```json
   {
     "userId": "postman-user",
     "username": "PostmanTester",
     "message": "Testing from Postman!"
   }
   ```
4. Click **Send**
5. Should return success response with message details

### **Step 3: Test Real-time Connection**

1. Create new request: `GET http://localhost:3000/api/chat/sse?userId=postman-user&username=PostmanTester`
2. Click **Send**
3. You should see streaming data like:
   ```
   data: {"type":"connected","data":{"clientId":"..."}}
   data: {"type":"userCount","data":{"count":1}}
   ```
4. Keep this connection open

### **Step 4: Test Real-time Broadcasting**

1. **Keep the SSE connection from Step 3 open**
2. In a **new tab**, send a message using Step 2
3. **Go back to the SSE tab** - you should see the new message appear in real-time:
   ```
   data: {"type":"message","data":{"id":"...","userId":"postman-user","username":"PostmanTester","message":"Testing from Postman!","timestamp":...}}
   ```

---

## 🔍 Testing Scenarios

### **Scenario 1: Multiple Users**

1. Open **2 SSE connections** with different userIds:
   - Tab 1: `userId=user1&username=Alice`
   - Tab 2: `userId=user2&username=Bob`
2. Send message as `user1`
3. Both SSE connections should receive the message
4. User count should show `2`

### **Scenario 2: Error Handling**

**Test Missing Parameters**:
```
POST /api/chat
Body: {"userId": "test"} // Missing username and message
Expected: 400 Bad Request
```

**Test Invalid SSE Connection**:
```
GET /api/chat/sse?userId=test
// Missing username parameter
Expected: 400 Bad Request
```

### **Scenario 3: Message Persistence**

1. Send several messages via POST
2. Fetch messages via GET
3. All sent messages should appear in the response

---

## 📊 Postman Collection

Here's a ready-to-import Postman collection:

```json
{
  "info": {
    "name": "Crypto Portfolio Chat API",
    "description": "Test collection for chat functionality"
  },
  "item": [
    {
      "name": "Get Messages",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/chat?userId=test-user&limit=10",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat"],
          "query": [
            {"key": "userId", "value": "test-user"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Send Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"postman-user\",\n  \"username\": \"PostmanTester\",\n  \"message\": \"Hello from Postman!\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/chat",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat"]
        }
      }
    },
    {
      "name": "SSE Connection",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/chat/sse?userId=postman-user&username=PostmanTester",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat", "sse"],
          "query": [
            {"key": "userId", "value": "postman-user"},
            {"key": "username", "value": "PostmanTester"}
          ]
        }
      }
    },
    {
      "name": "Seed Demo Messages",
      "request": {
        "method": "POST",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/chat/seed",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat", "seed"]
        }
      }
    }
  ]
}
```

**To import this collection**:
1. Copy the JSON above
2. In Postman, click **Import**
3. Select **Raw text** and paste the JSON
4. Click **Continue** and **Import**

---

## 🐛 Troubleshooting

### **Common Issues**:

**1. Connection Refused**
- ✅ Make sure dev server is running: `npm run dev`
- ✅ Check URL is `http://localhost:3000`

**2. 400 Bad Request**
- ✅ Check required parameters are included
- ✅ Verify JSON format in POST body

**3. SSE Not Working**
- ✅ Make sure to use GET method for SSE
- ✅ Check browser console for errors
- ✅ Verify userId and username parameters

**4. Messages Not Broadcasting**
- ✅ Keep SSE connection open while sending messages
- ✅ Check server console for broadcast logs
- ✅ Try with different userIds

### **Debug Tips**:

1. **Check Server Logs**: Look at your terminal running `npm run dev`
2. **Use Browser DevTools**: Network tab shows SSE connections
3. **Test in Browser**: Use the `/chat` page with debug panel
4. **Multiple Tabs**: Open chat in multiple browser tabs to test real-time sync

---

## 🎯 Expected Results

After successful testing, you should see:

✅ **Messages fetch correctly** with demo data  
✅ **New messages save** and return success response  
✅ **SSE connections establish** and show connected status  
✅ **Real-time broadcasting works** across multiple connections  
✅ **User count updates** when connections open/close  
✅ **Heartbeat messages** keep connections alive  

---

## 🚀 Next Steps

Once API testing is successful:

1. **Test in Browser**: Use the chat UI at `/chat`
2. **Test Multiple Users**: Open multiple browser tabs
3. **Test Mobile**: Check responsive design
4. **Load Testing**: Try with many concurrent connections
5. **Production Setup**: Replace in-memory storage with database

Happy testing! 🧪✨