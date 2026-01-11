/**
 * TesterHandbookModal - Sổ tay Tester
 * 
 * Hướng dẫn toàn diện cho tester bao gồm:
 * - Thuật ngữ testing
 * - Mức độ nghiêm trọng (Severity)
 * - Chiến lược test hiệu quả
 * - Cách lập kế hoạch test
 * - Cách viết Happy/Bad cases
 * - Đề xuất ngược lại cho dev
 * - Hướng dẫn dùng Feedback
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, X, ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Ban, Clock, RefreshCw, Target, Lightbulb, FileText, MessageSquare,
  Bug, Zap, Shield, Users, Clipboard, Search, Star, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ========== CONTENT DATA ==========

const SEVERITY_LEVELS = [
  {
    id: 'blocker',
    name: 'Blocker',
    color: 'bg-black text-white',
    icon: Ban,
    description: 'Chặn hoàn toàn, không thể tiếp tục test hoặc sử dụng hệ thống',
    examples: [
      'Không thể đăng nhập vào hệ thống',
      'Ứng dụng bị crash liên tục',
      'Database không kết nối được',
      'API chính không hoạt động'
    ],
    action: 'Phải sửa NGAY LẬP TỨC, dừng mọi release'
  },
  {
    id: 'critical',
    name: 'Critical',
    color: 'bg-red-600 text-white',
    icon: AlertTriangle,
    description: 'Lỗi nghiêm trọng ảnh hưởng chức năng chính, không có cách xử lý thay thế',
    examples: [
      'Thanh toán bị lỗi, mất tiền khách hàng',
      'Dữ liệu bị xóa không thể khôi phục',
      'Bảo mật bị lộ thông tin nhạy cảm',
      'Đơn hàng không thể tạo được'
    ],
    action: 'Phải sửa trong ngày, ưu tiên cao nhất'
  },
  {
    id: 'major',
    name: 'Major',
    color: 'bg-orange-500 text-white',
    icon: XCircle,
    description: 'Lỗi lớn ảnh hưởng chức năng quan trọng, có thể có workaround',
    examples: [
      'Không thể xuất báo cáo Excel',
      'Filter không hoạt động đúng',
      'Validation không chặn được input sai',
      'Email thông báo không gửi được'
    ],
    action: 'Cần sửa trong sprint hiện tại'
  },
  {
    id: 'minor',
    name: 'Minor',
    color: 'bg-yellow-500 text-white',
    icon: Clock,
    description: 'Lỗi nhỏ ảnh hưởng UX nhưng không làm gián đoạn nghiệp vụ',
    examples: [
      'Text bị cắt trong UI',
      'Màu sắc không đúng design',
      'Animation bị giật',
      'Thông báo không rõ ràng'
    ],
    action: 'Backlog, sửa khi có thời gian'
  },
  {
    id: 'trivial',
    name: 'Trivial',
    color: 'bg-gray-400 text-white',
    icon: FileText,
    description: 'Vấn đề rất nhỏ, cosmetic, suggestion cải thiện',
    examples: [
      'Typo trong text',
      'Khoảng cách spacing chưa đẹp',
      'Icon có thể đổi cho phù hợp hơn',
      'Suggestion cải thiện UX'
    ],
    action: 'Nice-to-have, xem xét sau'
  }
];

const TEST_STATUS_GUIDE = [
  {
    status: 'pending',
    name: 'Chờ test',
    icon: Clock,
    color: 'bg-gray-100 text-gray-700',
    description: 'Test case chưa được thực hiện, đang đợi tester',
    action: 'Tester cần thực hiện test theo các bước mô tả'
  },
  {
    status: 'passed',
    name: 'Đạt (Passed)',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
    description: 'Kết quả thực tế khớp với kết quả mong đợi',
    action: 'Đã hoàn thành, không cần hành động thêm'
  },
  {
    status: 'failed',
    name: 'Lỗi (Failed)',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    description: 'Kết quả thực tế KHÔNG khớp với mong đợi',
    action: 'Cần ghi chi tiết lỗi, screenshot, video nếu có'
  },
  {
    status: 'blocked',
    name: 'Bị chặn (Blocked)',
    icon: Ban,
    color: 'bg-orange-100 text-orange-700',
    description: 'Không thể test vì phụ thuộc vào lỗi khác hoặc thiếu điều kiện',
    action: 'Ghi rõ bị chặn bởi vấn đề nào, chờ giải quyết'
  },
  {
    status: 'skipped',
    name: 'Bỏ qua (Skipped)',
    icon: RefreshCw,
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Không thực hiện test vì lý do hợp lệ',
    action: 'Ghi lý do bỏ qua (ví dụ: out of scope, đã test ở case khác)'
  },
  {
    status: 'ready_for_retest',
    name: 'Sẵn sàng test lại',
    icon: RefreshCw,
    color: 'bg-blue-100 text-blue-700',
    description: 'Developer đã sửa lỗi, cần tester verify lại',
    action: 'Ưu tiên test lại các case này để xác nhận fix'
  }
];

const TESTING_STRATEGIES = [
  {
    name: 'Functional Testing',
    icon: CheckCircle,
    description: 'Test chức năng có hoạt động đúng theo yêu cầu',
    tips: [
      'Đọc kỹ requirements trước khi test',
      'Test từng chức năng độc lập',
      'Verify cả input hợp lệ và không hợp lệ',
      'Kiểm tra edge cases (giới hạn, rỗng, quá dài...)'
    ]
  },
  {
    name: 'Regression Testing',
    icon: RefreshCw,
    description: 'Kiểm tra các chức năng cũ vẫn hoạt động sau khi có thay đổi',
    tips: [
      'Chạy lại test cases quan trọng sau mỗi release',
      'Ưu tiên test các chức năng liên quan đến thay đổi',
      'Dùng checklist các flow chính',
      'Báo ngay nếu phát hiện regression'
    ]
  },
  {
    name: 'Exploratory Testing',
    icon: Search,
    description: 'Khám phá tự do để tìm lỗi không có trong test case',
    tips: [
      'Đặt mình vào vị trí user thực tế',
      'Thử các hành vi "kỳ lạ" mà user có thể làm',
      'Ghi chép những gì phát hiện được',
      'Không bị giới hạn bởi test case có sẵn'
    ]
  },
  {
    name: 'Boundary Testing',
    icon: Target,
    description: 'Test các giá trị biên, giới hạn của input',
    tips: [
      'Input tối thiểu (0, empty, null)',
      'Input tối đa (max length, max number)',
      'Input vượt giới hạn (overflow)',
      'Input đặc biệt (emoji, unicode, SQL injection...)'
    ]
  },
  {
    name: 'Negative Testing',
    icon: XCircle,
    description: 'Cố tình test với input sai để verify xử lý lỗi',
    tips: [
      'Nhập sai định dạng (email, phone...)',
      'Bỏ trống required fields',
      'Gửi request với data corrupt',
      'Test permission/authorization'
    ]
  }
];

const HAPPY_VS_BAD_CASES = {
  happy: {
    title: 'Happy Cases (Positive)',
    description: 'Các kịch bản người dùng thao tác ĐÚNG, hệ thống hoạt động bình thường',
    color: 'bg-green-50 border-green-200',
    examples: [
      {
        feature: 'Đăng nhập',
        case: 'User nhập đúng email + password → đăng nhập thành công'
      },
      {
        feature: 'Đặt hàng',
        case: 'User thêm sản phẩm → nhập địa chỉ hợp lệ → thanh toán → đơn hàng được tạo'
      },
      {
        feature: 'Tìm kiếm',
        case: 'User nhập từ khóa → hiện kết quả phù hợp'
      }
    ]
  },
  bad: {
    title: 'Bad Cases (Negative)',
    description: 'Các kịch bản người dùng thao tác SAI, test xử lý lỗi của hệ thống',
    color: 'bg-red-50 border-red-200',
    examples: [
      {
        feature: 'Đăng nhập',
        case: 'User nhập sai password → hiện thông báo lỗi phù hợp, không crash'
      },
      {
        feature: 'Đặt hàng',
        case: 'User bỏ trống địa chỉ → validation chặn, hiển thị lỗi rõ ràng'
      },
      {
        feature: 'Tìm kiếm',
        case: 'User nhập ký tự đặc biệt → không bị SQL injection, hiện "không có kết quả"'
      }
    ]
  },
  edge: {
    title: 'Edge Cases (Boundary)',
    description: 'Các kịch bản ở ranh giới, giới hạn của hệ thống',
    color: 'bg-yellow-50 border-yellow-200',
    examples: [
      {
        feature: 'Đăng nhập',
        case: 'Password đúng 255 ký tự (max) → hệ thống xử lý được'
      },
      {
        feature: 'Đặt hàng',
        case: 'Đặt 9999 sản phẩm (gần max) → hệ thống tính đúng tổng tiền'
      },
      {
        feature: 'Upload',
        case: 'Upload file đúng 10MB (max size) → upload thành công'
      }
    ]
  }
};

const FEEDBACK_GUIDE = {
  when: [
    'Phát hiện bug không có trong test case',
    'Gặp vấn đề UX/UI cần cải thiện',
    'Có đề xuất tính năng mới',
    'Có câu hỏi về requirements',
    'Cần clarification từ dev/BA'
  ],
  how: [
    {
      step: 1,
      title: 'Mô tả ngắn gọn',
      desc: 'Tiêu đề rõ ràng, tóm tắt vấn đề trong 1 câu'
    },
    {
      step: 2,
      title: 'Các bước tái hiện',
      desc: 'Liệt kê từng bước để dev có thể reproduce lỗi'
    },
    {
      step: 3,
      title: 'Kết quả mong đợi vs thực tế',
      desc: 'Nêu rõ expected vs actual result'
    },
    {
      step: 4,
      title: 'Đính kèm evidence',
      desc: 'Screenshot, video recording, log nếu có'
    },
    {
      step: 5,
      title: 'Chọn đúng severity',
      desc: 'Đánh giá mức độ nghiêm trọng phù hợp'
    }
  ],
  tips: [
    '📸 Luôn chụp screenshot hoặc quay video',
    '🔗 Ghi rõ URL/page xảy ra lỗi',
    '📱 Ghi thông tin browser/device',
    '🔄 Thử reproduce lại trước khi report',
    '🎯 1 bug = 1 feedback (không gộp nhiều bug)'
  ]
};

const DEV_PROPOSAL_GUIDE = {
  title: 'Đề xuất ngược cho Dev',
  description: 'Khi test list chưa đủ hoặc tester phát hiện vấn đề, tester có thể đề xuất:',
  items: [
    {
      type: 'Test case bổ sung',
      desc: 'Đề xuất thêm test case cho các kịch bản chưa được cover',
      example: 'Suggest: Cần test case cho việc user cancel order sau khi thanh toán'
    },
    {
      type: 'Edge case thiếu',
      desc: 'Phát hiện boundary chưa được test',
      example: 'Suggest: Test với số điện thoại quốc tế (+84, +1...)'
    },
    {
      type: 'Security concern',
      desc: 'Phát hiện nguy cơ bảo mật tiềm ẩn',
      example: 'Suggest: Cần test XSS injection ở field comment'
    },
    {
      type: 'UX improvement',
      desc: 'Đề xuất cải thiện trải nghiệm người dùng',
      example: 'Suggest: Button "Submit" nên disable khi đang loading'
    },
    {
      type: 'Performance concern',
      desc: 'Phát hiện vấn đề hiệu năng',
      example: 'Suggest: Page load > 5s với 1000 records, cần pagination'
    }
  ],
  howTo: 'Sử dụng tính năng Feedback với type "Đề xuất" để gửi cho team dev xem xét.'
};

// ========== COMPONENT ==========

export default function TesterHandbookModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('severity');

  const sections = [
    { id: 'severity', name: 'Mức độ nghiêm trọng', icon: AlertTriangle },
    { id: 'status', name: 'Trạng thái Test Case', icon: CheckCircle },
    { id: 'strategy', name: 'Chiến lược Test', icon: Target },
    { id: 'cases', name: 'Happy/Bad Cases', icon: Lightbulb },
    { id: 'feedback', name: 'Hướng dẫn Feedback', icon: MessageSquare },
    { id: 'proposal', name: 'Đề xuất cho Dev', icon: Users },
    { id: 'tips', name: 'Tips & Best Practices', icon: Star }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-violet-500 to-purple-600">
          <DialogTitle className="flex items-center gap-3 text-white">
            <BookOpen className="w-6 h-6" />
            Sổ Tay Tester
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-56 border-r bg-gray-50 p-3">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-violet-100 text-violet-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 h-[calc(85vh-80px)]">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Severity Section */}
                  {activeSection === 'severity' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Mức Độ Nghiêm Trọng (Severity)
                        </h2>
                        <p className="text-gray-600">
                          Khi phát hiện lỗi, tester cần đánh giá mức độ nghiêm trọng để dev ưu tiên sửa đúng.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {SEVERITY_LEVELS.map((level) => {
                          const Icon = level.icon;
                          return (
                            <div key={level.id} className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge className={level.color}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {level.name}
                                </Badge>
                                <span className="text-sm text-gray-600">{level.description}</span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-2">VÍ DỤ:</p>
                                  <ul className="space-y-1">
                                    {level.examples.map((ex, i) => (
                                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-violet-500 mt-1">•</span>
                                        {ex}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-medium text-gray-500 mb-1">HÀNH ĐỘNG:</p>
                                  <p className="text-sm text-gray-700">{level.action}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status Section */}
                  {activeSection === 'status' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Trạng Thái Test Case
                        </h2>
                        <p className="text-gray-600">
                          Hiểu rõ ý nghĩa từng trạng thái để cập nhật chính xác.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        {TEST_STATUS_GUIDE.map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.status} className="border rounded-lg p-4 flex gap-4">
                              <div className="flex-shrink-0">
                                <Badge className={item.color}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {item.name}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                                <p className="text-xs text-gray-500">
                                  <strong>Hành động:</strong> {item.action}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strategy Section */}
                  {activeSection === 'strategy' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Chiến Lược Test Hiệu Quả
                        </h2>
                        <p className="text-gray-600">
                          Áp dụng các chiến lược này để tìm ra nhiều bug hơn.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {TESTING_STRATEGIES.map((strategy) => {
                          const Icon = strategy.icon;
                          return (
                            <div key={strategy.name} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-violet-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{strategy.name}</h3>
                                  <p className="text-xs text-gray-500">{strategy.description}</p>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-2">TIPS:</p>
                                <ul className="grid md:grid-cols-2 gap-2">
                                  {strategy.tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <ChevronRight className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Happy/Bad Cases Section */}
                  {activeSection === 'cases' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Happy Cases vs Bad Cases
                        </h2>
                        <p className="text-gray-600">
                          Tester cần đề xuất bổ sung test cases nếu dev/BA chưa cover đủ.
                        </p>
                      </div>

                      {Object.entries(HAPPY_VS_BAD_CASES).map(([key, data]) => (
                        <div key={key} className={`border rounded-lg p-4 ${data.color}`}>
                          <h3 className="font-bold text-gray-900 mb-1">{data.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{data.description}</p>
                          
                          <div className="space-y-3">
                            {data.examples.map((ex, i) => (
                              <div key={i} className="bg-white/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{ex.feature}</p>
                                <p className="text-sm text-gray-700">{ex.case}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-violet-800 mb-1">Khi nào đề xuất thêm case?</p>
                            <ul className="text-sm text-violet-700 space-y-1">
                              <li>• Test list chỉ có Happy cases → đề xuất thêm Bad cases</li>
                              <li>• Thiếu edge cases → đề xuất boundary testing</li>
                              <li>• Thiếu test cho error handling → đề xuất negative cases</li>
                              <li>• Flow phức tạp thiếu test → đề xuất bổ sung</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {activeSection === 'feedback' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Hướng Dẫn Sử Dụng Feedback
                        </h2>
                        <p className="text-gray-600">
                          Cách report bug và đề xuất hiệu quả qua hệ thống Feedback.
                        </p>
                      </div>

                      {/* When to use */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-violet-500" />
                          Khi nào dùng Feedback?
                        </h3>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {FEEDBACK_GUIDE.when.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* How to */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-violet-500" />
                          5 Bước Report Bug Chuẩn
                        </h3>
                        <div className="space-y-3">
                          {FEEDBACK_GUIDE.how.map((step) => (
                            <div key={step.step} className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {step.step}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{step.title}</p>
                                <p className="text-xs text-gray-500">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-medium text-amber-800 mb-2">💡 Tips Report Hiệu Quả</h3>
                        <ul className="space-y-1">
                          {FEEDBACK_GUIDE.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-amber-700">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Dev Proposal Section */}
                  {activeSection === 'proposal' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {DEV_PROPOSAL_GUIDE.title}
                        </h2>
                        <p className="text-gray-600">
                          {DEV_PROPOSAL_GUIDE.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {DEV_PROPOSAL_GUIDE.items.map((item, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-violet-50">
                                {item.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                            <div className="bg-gray-50 rounded p-2 text-xs text-gray-500 font-mono">
                              {item.example}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800 mb-1">Cách gửi đề xuất</p>
                            <p className="text-sm text-blue-700">
                              {DEV_PROPOSAL_GUIDE.howTo}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips Section */}
                  {activeSection === 'tips' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Tips & Best Practices
                        </h2>
                        <p className="text-gray-600">
                          Các mẹo giúp bạn trở thành tester hiệu quả hơn.
                        </p>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="planning">
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <Clipboard className="w-4 h-4 text-violet-500" />
                              Lập Kế Hoạch Test
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li>• Đọc requirements/user stories trước khi test</li>
                              <li>• Xác định các chức năng chính cần test</li>
                              <li>• Ưu tiên test theo risk (cao → thấp)</li>
                              <li>• Phân bổ thời gian hợp lý cho từng module</li>
                              <li>• Dự trù thời gian cho regression</li>
                              <li>• Chuẩn bị test data trước</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="skills">
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-violet-500" />
                              Kỹ Năng Tester Cần Có
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li>• <strong>Attention to detail:</strong> Chú ý từng chi tiết nhỏ</li>
                              <li>• <strong>Critical thinking:</strong> Đặt câu hỏi "What if...?"</li>
                              <li>• <strong>Communication:</strong> Mô tả bug rõ ràng, dễ hiểu</li>
                              <li>• <strong>Technical knowledge:</strong> Hiểu cơ bản về web, API, database</li>
                              <li>• <strong>Domain knowledge:</strong> Hiểu nghiệp vụ đang test</li>
                              <li>• <strong>Patience:</strong> Kiên nhẫn với các test lặp lại</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="evidence">
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-violet-500" />
                              Thu Thập Evidence
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li>• Screenshot: Chụp màn hình khi gặp lỗi</li>
                              <li>• Video: Quay lại các bước reproduce bug</li>
                              <li>• Console log: Copy log lỗi từ DevTools</li>
                              <li>• Network: Capture API response nếu liên quan</li>
                              <li>• Test data: Ghi lại input gây lỗi</li>
                              <li>• Environment: Browser, OS, device info</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="communication">
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-violet-500" />
                              Giao Tiếp Với Dev
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li>• Mô tả bug một cách khách quan, không đổ lỗi</li>
                              <li>• Cung cấp đủ thông tin để reproduce</li>
                              <li>• Sẵn sàng clarify nếu dev cần thêm thông tin</li>
                              <li>• Verify fix kịp thời khi dev sửa xong</li>
                              <li>• Appreciate dev khi họ fix nhanh</li>
                              <li>• Collaborative, không adversarial</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="common-mistakes">
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <Bug className="w-4 h-4 text-violet-500" />
                              Lỗi Thường Gặp Của Tester
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li>❌ Chỉ test happy path, bỏ qua negative cases</li>
                              <li>❌ Không reproduce lại trước khi report</li>
                              <li>❌ Bug report thiếu thông tin</li>
                              <li>❌ Đánh giá severity không chính xác</li>
                              <li>❌ Không verify fix, chỉ đóng bug</li>
                              <li>❌ Copy test case mà không hiểu context</li>
                              <li>❌ Bỏ qua regression testing</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-violet-800 mb-1">Golden Rule</p>
                            <p className="text-sm text-violet-700">
                              "Test early, test often, test thoroughly. The best bug is the one you prevent, not the one you find."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}