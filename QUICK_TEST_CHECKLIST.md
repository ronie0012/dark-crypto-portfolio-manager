# ✅ Quick Test Checklist for Chat API

## 🚀 Before You Start

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   ✅ Server should be running on `http://localhost:3000`

2. **Import Postman Files** (Optional but Recommended)
   - Import `postman-collection.json` 
   - Import `postman-environment.json`

---

## 🧪 Quick Tests (5 minutes)

### **Test 1: API Health Check** ⚡
**URL**: `GET http://localhost:3000/api/chat/test`

**Expected Result**:
```json
{
  "status": "success",
  "message": "Chat API is working!",
  "endpoints": { ... }
}
```

### **Test 2: Fetch Demo Messages** 📥
**URL**: `GET http://localhost:3000/api/chat?userId=test&limit=5`

**Expected Result**: Should return 6 demo messages

### **Test 3: Send a Message** 📤
**Method**: `POST`  
**URL**: `http://localhost:3000/api/chat`  
**Body**:
```json
{
  "userId": "postman-user",
  "username": "Tester",
  "message": "Hello World!"
}
```

**Expected Result**: Success response with message details

### **Test 4: Real-time Connection** 🔄
**URL**: `GET http://localhost:3000/api/chat/sse?userId=test&username=Tester`

**Expected Result**: Streaming data starting with:
```
data: {"type":"connected","data":{"clientId":"..."}}
```

---

## 🎯 Advanced Tests (10 minutes)

### **Multi-User Real-time Test**

1. **Open 2 SSE connections** in separate Postman tabs:
   - Tab 1: `userId=alice&username=Alice`
   - Tab 2: `userId=bob&username=Bob`

2. **Send message as Alice**:
   ```json
   {
     "userId": "alice",
     "username": "Alice", 
     "message": "Hi Bob!"
   }
   ```

3. **Check both SSE tabs** - both should receive the message

### **Load Test**
- Send 10 messages rapidly using the "Send Multiple Test Messages" request
- All messages should appear in GET /api/chat

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check if `npm run dev` is running |
| 400 Bad Request | Verify JSON body format and required fields |
| SSE not streaming | Use GET method, check userId/username params |
| Messages not syncing | Keep SSE connection open while sending messages |

---

## 🎉 Success Indicators

✅ **API Test**: Returns success status  
✅ **Message Fetch**: Returns demo messages  
✅ **Message Send**: Returns success with message ID  
✅ **SSE Connection**: Shows "connected" and user count  
✅ **Real-time Sync**: Messages appear instantly in SSE stream  
✅ **Multi-user**: Multiple connections receive broadcasts  

---

## 🔗 Quick Links

- **Chat UI**: http://localhost:3000/chat
- **API Health**: http://localhost:3000/api/chat/test
- **Postman Collection**: Import `postman-collection.json`
- **Environment**: Import `postman-environment.json`

---

**Total Test Time**: ~5-15 minutes  
**Prerequisites**: Development server running  
**Tools**: Postman (or any HTTP client)