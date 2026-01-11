import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Code, Copy, Eye, EyeOff, Key, RefreshCw, Shield,
  CheckCircle, AlertCircle, X, Terminal, Book, Zap
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const API_ENDPOINTS = [
  {
    category: "Products",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/products",
        description: "List all products",
        params: ["limit", "offset", "category", "status"],
        response: `{
  "data": [
    {
      "id": "prod_123",
      "name": "Rau Xà Lách Organic",
      "price": 25000,
      "category": "vegetables",
      "stock_quantity": 100
    }
  ],
  "total": 50,
  "page": 1
}`
      },
      {
        method: "POST",
        path: "/api/v1/products",
        description: "Create a new product",
        body: `{
  "name": "Rau Xà Lách Organic",
  "category": "vegetables",
  "price": 25000,
  "unit": "kg",
  "stock_quantity": 100
}`,
        response: `{
  "id": "prod_123",
  "name": "Rau Xà Lách Organic",
  "created_at": "2024-01-01T00:00:00Z"
}`
      }
    ]
  },
  {
    category: "Orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/orders",
        description: "List all orders",
        params: ["limit", "offset", "status", "date_from", "date_to"],
        response: `{
  "data": [
    {
      "id": "ord_456",
      "order_number": "ZF-2024-001",
      "customer_name": "Nguyễn Văn A",
      "total_amount": 500000,
      "status": "confirmed"
    }
  ]
}`
      },
      {
        method: "PATCH",
        path: "/api/v1/orders/{id}",
        description: "Update order status",
        body: `{
  "status": "shipping",
  "tracking_number": "VN123456"
}`,
        response: `{
  "id": "ord_456",
  "status": "shipping",
  "updated_at": "2024-01-01T00:00:00Z"
}`
      }
    ]
  },
  {
    category: "Customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/customers",
        description: "List all customers",
        params: ["limit", "offset", "type"],
        response: `{
  "data": [
    {
      "id": "cust_789",
      "full_name": "Nguyễn Văn A",
      "email": "customer@example.com",
      "phone": "0987654321",
      "total_orders": 5,
      "total_spent": 2500000
    }
  ]
}`
      }
    ]
  }
];

export default function TenantApiDocs() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  // Fetch tenant data
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-api', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Check if tenant has API access (Pro+ only)
  const hasApiAccess = tenant?.subscription_plan === 'pro' || tenant?.subscription_plan === 'enterprise';

  // Generate API key (mock - in production, this should be secured)
  React.useEffect(() => {
    if (tenant && hasApiAccess) {
      // Mock API key generation
      const key = `zf_${tenant.slug}_${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(key);
    }
  }, [tenant, hasApiAccess]);

  const copyToClipboard = (text, identifier) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(identifier);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const regenerateApiKey = () => {
    const newKey = `zf_${tenant.slug}_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    alert('⚠️ API key đã được tạo mới. Hãy cập nhật key mới vào ứng dụng của bạn!');
  };

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!hasApiAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F]">API Documentation</h1>
              <button
                onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
                className="text-gray-600 hover:text-[#7CB342] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 text-center border-2 border-purple-200">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              API Access - Pro Feature
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              API access chỉ dành cho gói Pro và Enterprise. Nâng cấp ngay để tích hợp Zero Farm với hệ thống của bạn.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(createPageUrl(`TenantBilling?tenant=${tenantId}`))}
                className="bg-[#7CB342] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Nâng Cấp Lên Pro
              </button>
              <button
                onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors border-2 border-gray-200"
              >
                Quay Lại Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F] flex items-center gap-3">
                <Terminal className="w-8 h-8 text-[#7CB342]" />
                API Documentation
              </h1>
              <p className="text-gray-600">RESTful API cho {tenant.organization_name}</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
              className="text-gray-600 hover:text-[#7CB342] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* API Key Section */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6" />
            <h2 className="text-2xl font-bold">API Key</h2>
          </div>
          <p className="text-white/90 mb-6">
            Sử dụng API key này trong header của mọi request: <code className="bg-white/20 px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 font-mono text-lg">
                {showApiKey ? apiKey : '•'.repeat(50)}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={() => copyToClipboard(apiKey, 'apikey')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copiedEndpoint === 'apikey' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={regenerateApiKey}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tạo Key Mới
            </button>
            <p className="text-sm text-white/80">
              ⚠️ Tạo key mới sẽ vô hiệu hóa key cũ
            </p>
          </div>
        </div>

        {/* Base URL */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-[#7CB342]" />
            Base URL
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
            https://api.zerofarm.vn/tenants/{tenant.slug}
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {API_ENDPOINTS.map((category) => (
            <div key={category.category} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-[#7CB342]" />
                {category.category}
              </h2>

              <div className="space-y-6">
                {category.endpoints.map((endpoint, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Endpoint Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                          endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="flex-1 font-mono text-gray-900">{endpoint.path}</code>
                        <button
                          onClick={() => copyToClipboard(endpoint.path, `endpoint-${idx}`)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {copiedEndpoint === `endpoint-${idx}` ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm">{endpoint.description}</p>
                    </div>

                    {/* Endpoint Details */}
                    <div className="p-4 space-y-4">
                      {/* Parameters */}
                      {endpoint.params && (
                        <div>
                          <h4 className="font-bold text-sm text-gray-700 mb-2">Query Parameters:</h4>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.params.map((param) => (
                              <code key={param} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                                {param}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.body && (
                        <div>
                          <h4 className="font-bold text-sm text-gray-700 mb-2">Request Body:</h4>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
                            {endpoint.body}
                          </pre>
                        </div>
                      )}

                      {/* Response */}
                      <div>
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Response:</h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
                          {endpoint.response}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rate Limits & Best Practices */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
            <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Rate Limits
            </h3>
            <ul className="space-y-2 text-sm text-orange-800">
              <li>• <strong>Pro:</strong> 1,000 requests/hour</li>
              <li>• <strong>Enterprise:</strong> 10,000 requests/hour</li>
              <li>• Vượt giới hạn sẽ trả về <code>429 Too Many Requests</code></li>
              <li>• Header <code>X-RateLimit-Remaining</code> cho biết số request còn lại</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Luôn kiểm tra HTTP status code</li>
              <li>• Sử dụng pagination cho list endpoints</li>
              <li>• Cache responses khi có thể</li>
              <li>• Implement exponential backoff cho retries</li>
            </ul>
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mt-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Cần Hỗ Trợ?</h3>
          <p className="text-gray-600 mb-6">
            Gặp vấn đề với API? Liên hệ với đội ngũ support của chúng tôi.
          </p>
          <button className="bg-[#7CB342] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors">
            Liên Hệ Support
          </button>
        </div>
      </div>
    </div>
  );
}