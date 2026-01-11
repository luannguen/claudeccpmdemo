import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Leaf, Bot, User } from "lucide-react";

export default function ChatBotEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý ảo của Zero Farm 🌱\n\nTôi có thể giúp bạn:\n\n🌿 Tư vấn chọn sản phẩm organic phù hợp\n🛒 Hướng dẫn đặt hàng\n📦 Kiểm tra đơn hàng\n🚚 Thông tin giao hàng\n💰 Báo giá sản phẩm\n🏡 Giới thiệu về trang trại\n\nBạn cần tôi hỗ trợ gì hôm nay?",
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

  // ✅ Listen for open-chatbot event from BottomNavBar
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

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

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "Cảm ơn bạn đã quan tâm đến Zero Farm! Sản phẩm của chúng tôi đều là organic 100%, không dư lượng hóa chất. Bạn có muốn xem danh mục sản phẩm không?",
        "Tất cả rau củ được thu hoạch vào buổi sáng sớm và giao trong ngày. Đặt hàng trước 9h sáng để nhận hàng cùng ngày nhé! 🚚",
        "Chúng tôi có nhiều combo tiết kiệm cho gia đình. Bạn quan tâm đến loại rau củ nào nhất?",
        "Giá sản phẩm dao động từ 25.000đ - 180.000đ tùy loại. Miễn phí ship cho đơn từ 200.000đ. Bạn muốn đặt hàng ngay không? 📞 098 765 4321"
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: Date.now() + 1,
        text: randomResponse,
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
      {/* ✅ Chat Button - Hidden on mobile (BottomNav handles it), visible on desktop */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white rounded-full shadow-lg items-center justify-center transition-all duration-300 w-12 h-12 z-40 hidden lg:flex ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Mở trợ lý ảo Zero Farm"
      >
        <MessageCircle className="w-5 h-5" />
        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <Leaf className="w-2.5 h-2.5 text-white" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-2 right-2 w-[calc(100%-1rem)] max-w-sm h-[70vh] sm:bottom-4 sm:right-4 sm:w-96 sm:h-[600px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[#7CB342]/20"
          >
            {/* ✅ Header - Compact on Mobile */}
            <div className="bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white p-2.5 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold">Trợ Lý Zero Farm</h3>
                  <p className="text-xs opacity-90 hidden sm:block">Tư Vấn Organic • Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Đóng chat"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* ✅ Messages - Compact on Mobile */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-1.5 sm:gap-2 max-w-[85%]`}>
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${message.sender === 'user' ? 'bg-[#7CB342] text-white ml-1 sm:ml-2' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`text-xs mt-0.5 sm:mt-1 text-right ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7CB342] flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7CB342] flex items-center justify-center">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ✅ Quick Actions - Compact on Mobile */}
            <div className="px-2 sm:px-4 py-1.5 sm:py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setInputText("Tôi muốn đặt hàng")}
                  className="px-2.5 sm:px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800] transition-colors"
                >
                  🛒 Đặt Hàng
                </button>
                <button
                  onClick={() => setInputText("Xem bảng giá sản phẩm")}
                  className="px-2.5 sm:px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800] transition-colors"
                >
                  💰 Giá
                </button>
                <button
                  onClick={() => setInputText("Trang trại ở đâu?")}
                  className="px-2.5 sm:px-3 py-1 bg-[#7CB342] text-white text-xs rounded-full whitespace-nowrap hover:bg-[#FF9800] transition-colors"
                >
                  📍 Địa Chỉ
                </button>
              </div>
            </div>

            {/* ✅ Input - Compact on Mobile */}
            <div className="p-2 sm:p-4 border-t border-gray-200">
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hỏi về sản phẩm..."
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#7CB342] transition-colors"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7CB342] to-[#FF9800] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            
            <style>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}