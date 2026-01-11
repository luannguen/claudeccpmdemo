import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Leaf, Bot, User } from "lucide-react";
import EnhancedModal from '../EnhancedModal';

export default function ChatBotEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý ảo của Zero Farm 🌱\n\nTôi có thể giúp bạn:\n\n🌿 Tư vấn sản phẩm organic\n🛒 Hướng dẫn đặt hàng\n📦 Kiểm tra đơn hàng\n🚚 Thông tin giao hàng\n💰 Báo giá\n\nBạn cần gì hôm nay?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponses = [
        "Cảm ơn bạn! Sản phẩm của chúng tôi đều organic 100%. Bạn có muốn xem danh mục không?",
        "Rau củ thu hoạch buổi sáng, giao trong ngày. Đặt trước 9h để nhận cùng ngày! 🚚",
        "Chúng tôi có nhiều combo tiết kiệm. Bạn quan tâm loại nào?",
        "Giá từ 25k - 180k. Freeship từ 200k. Đặt ngay? 📞 098 765 4321"
      ];
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white rounded-full shadow-2xl z-40 flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'scale-0' : 'scale-100'} w-16 h-16`}>
        <MessageCircle className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <Leaf className="w-3 h-3 text-white" />
        </div>
      </button>

      <EnhancedModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Trợ Lý Zero Farm"
        maxWidth="md"
        persistPosition={true}
        positionKey="chatbot"
        zIndex={95}
      >
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%]`}>
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl ${message.sender === 'user' ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    <p className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#7CB342] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-2 border-t bg-gray-50">
            <div className="flex gap-2 mb-2 overflow-x-auto">
              <button onClick={() => setInputText("Tôi muốn đặt hàng")}
                className="px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800]">
                🛒 Đặt Hàng
              </button>
              <button onClick={() => setInputText("Xem bảng giá")}
                className="px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800]">
                💰 Bảng Giá
              </button>
              <button onClick={() => setInputText("Địa chỉ?")}
                className="px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800]">
                📍 Địa Chỉ
              </button>
            </div>
          </div>

          <div className="p-6 border-t">
            <div className="flex gap-2">
              <input type="text" value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về sản phẩm..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-[#7CB342]"
                disabled={isTyping} />
              <button onClick={handleSendMessage} disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </EnhancedModal>
    </>
  );
}