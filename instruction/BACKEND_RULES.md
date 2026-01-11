# Backend Development Rules & Best Practices

> **Mục tiêu:**  
> - Giữ backend **an toàn – ổn định – dễ mở rộng**  
> - Tránh lỗi phổ biến khi lên production  
> - Áp dụng cho cả **developer** và **AI coding agent**

---

## 1️⃣ Không Expose Lỗi Nội Bộ Cho Client

**Mọi backend function PHẢI che giấu thông tin hệ thống:**

```javascript
// ❌ SAI - Expose stack trace/internal error
Deno.serve(async (req) => {
  try {
    const result = await base44.entities.Product.create(data);
    return Response.json(result);
  } catch (error) {
    return Response.json({ 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
});

// ✅ ĐÚNG - Log nội bộ, trả message chung cho client
Deno.serve(async (req) => {
  try {
    const result = await base44.entities.Product.create(data);
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[ProductCreate] Error:', error); // Log nội bộ
    return Response.json({ 
      success: false, 
      error: 'Không thể tạo sản phẩm. Vui lòng thử lại.' 
    }, { status: 500 });
  }
});
```

**Lý do:**
- Tránh lộ thông tin hệ thống (database schema, stack trace, internal paths)
- Giảm attack surface
- Bảo mật thông tin nhạy cảm

---

## 2️⃣ Luôn Sử Dụng DTO (Data Transfer Object)

**Backend PHẢI validate và map input qua DTO trước khi xử lý:**

```javascript
// ❌ SAI - Xử lý trực tiếp req.body
Deno.serve(async (req) => {
  const body = await req.json();
  const product = await base44.entities.Product.create(body); // Nguy hiểm!
  return Response.json(product);
});

// ✅ ĐÚNG - Validate qua DTO
Deno.serve(async (req) => {
  const body = await req.json();
  
  // Validate & map to DTO
  const dto = {
    name: body.name?.trim() || '',
    price: parseFloat(body.price) || 0,
    stock_quantity: parseInt(body.stock_quantity) || 0
  };
  
  // Validate required fields
  if (!dto.name) {
    return Response.json({ 
      error: 'Tên sản phẩm không được trống' 
    }, { status: 400 });
  }
  if (dto.price <= 0) {
    return Response.json({ 
      error: 'Giá phải lớn hơn 0' 
    }, { status: 400 });
  }
  
  const product = await base44.entities.Product.create(dto);
  return Response.json({ success: true, data: product });
});
```

**Lợi ích:**
- Ngăn field độc hại
- Bảo vệ database schema
- Kiểm soát input rõ ràng
- Type safety

---

## 3️⃣ Lưu JWT An Toàn (HTTP-only Cookies)

**KHÔNG bao giờ lưu JWT trong localStorage/sessionStorage:**

```javascript
// ❌ SAI - Frontend lưu JWT trong localStorage
localStorage.setItem('token', jwt);

// ✅ ĐÚNG - Backend set JWT trong HTTP-only cookie
Deno.serve(async (req) => {
  const jwt = await generateJWT(user);
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `token=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
    }
  });
});
```

**Cookie Flags:**
- `HttpOnly` - Không thể truy cập bằng JavaScript → chống XSS
- `Secure` - Chỉ gửi qua HTTPS
- `SameSite=Strict` - Chống CSRF
- `Max-Age` - Thời gian sống của cookie

---

## 4️⃣ Validate Toàn Bộ Input (Zero Trust)

**KHÔNG TIN bất kỳ dữ liệu nào từ client:**

```javascript
// ❌ SAI - Tin tưởng input
const userId = body.userId;
const amount = body.amount;
await processPayment(userId, amount);

// ✅ ĐÚNG - Validate mọi field
const userId = body.userId?.trim();
const amount = parseFloat(body.amount);

// Validate
if (!userId || userId.length < 5) {
  return Response.json({ 
    error: 'User ID không hợp lệ' 
  }, { status: 400 });
}
if (isNaN(amount) || amount <= 0) {
  return Response.json({ 
    error: 'Số tiền phải lớn hơn 0' 
  }, { status: 400 });
}

await processPayment(userId, amount);
```

**Validate:**
- Type (string, number, boolean, array, object)
- Format (email, phone, date, URL)
- Length (min, max)
- Range (min, max cho số)
- Required fields
- Enum values
- Pattern matching (regex)

**Áp dụng cho:**
- API public
- Webhook
- Background job input
- Internal service calls (nếu nhận data từ external)

---

## 5️⃣ Không Hardcode Secrets

**TUYỆT ĐỐI KHÔNG commit secrets vào code:**

```javascript
// ❌ SAI - Hardcode API key
const STRIPE_KEY = 'sk_live_abc123xyz';
const stripe = new Stripe(STRIPE_KEY);

// ✅ ĐÚNG - Dùng environment variable
const STRIPE_KEY = Deno.env.get('STRIPE_API_KEY');
if (!STRIPE_KEY) {
  throw new Error('Missing STRIPE_API_KEY environment variable');
}
const stripe = new Stripe(STRIPE_KEY);
```

**Nguyên tắc:**
- Code có thể public → secrets thì không
- Dùng `Deno.env.get()` cho environment variables
- Dùng secret manager nếu có (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets định kỳ
- Không log secrets

---

## 6️⃣ Sử Dụng Đúng HTTP Status Codes

**Backend PHẢI trả về status code đúng nghĩa:**

```javascript
// ❌ SAI - Luôn trả 200
return Response.json({ error: 'Not found' }, { status: 200 });

// ✅ ĐÚNG - Dùng đúng status
// Success
return Response.json({ data: result }, { status: 200 });

// Validation error
return Response.json({ 
  error: 'Tên không được trống' 
}, { status: 400 });

// Unauthorized
return Response.json({ 
  error: 'Chưa đăng nhập' 
}, { status: 401 });

// Forbidden
return Response.json({ 
  error: 'Không có quyền truy cập' 
}, { status: 403 });

// Not found
return Response.json({ 
  error: 'Không tìm thấy' 
}, { status: 404 });

// Server error
return Response.json({ 
  error: 'Lỗi hệ thống' 
}, { status: 500 });
```

**HTTP Status Codes Reference:**

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Operation thành công |
| 201 | Created | Resource mới được tạo |
| 204 | No Content | Delete thành công |
| 400 | Bad Request | Input validation failed |
| 401 | Unauthorized | Chưa đăng nhập |
| 403 | Forbidden | Không có quyền |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate entry |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Service đang maintenance |

---

## 7️⃣ Tách Business Logic Khỏi Controller

**Backend function chỉ là controller - không chứa business logic:**

```javascript
// ❌ SAI - Logic nghiệp vụ trực tiếp trong controller
Deno.serve(async (req) => {
  const body = await req.json();
  
  // 100 dòng validation + business logic + DB calls
  const commission = body.amount * 0.05;
  const tier = commission > 1000 ? 'gold' : 'silver';
  const result = await base44.entities.Order.create({...});
  
  return Response.json(result);
});

// ✅ ĐÚNG - Tách logic sang service
import { orderService } from './services/orderService.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Gọi service xử lý
    const result = await orderService.createOrder(body, user);
    
    if (!result.success) {
      return Response.json({ 
        error: result.message 
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: true, 
      data: result.data 
    });
  } catch (error) {
    console.error('[CreateOrder] Error:', error);
    return Response.json({ 
      error: 'Lỗi hệ thống' 
    }, { status: 500 });
  }
});
```

**Phân Chia Trách Nhiệm:**

| Layer | Responsibilities |
|-------|------------------|
| **Controller** | Parse request, validate auth, call service, format response |
| **Service** | Business logic, orchestrate domain + data |
| **Repository** | Database operations, external API calls |
| **Domain** | Business rules, validation, policies |

**Lợi ích:**
- Dễ test (test service riêng không cần HTTP)
- Dễ maintain (tách biệt concerns)
- Dễ refactor (thay đổi implementation không ảnh hưởng controller)

---

## 8️⃣ Structured Logging (Log Đúng Cách)

**Mọi backend function PHẢI có structured logging:**

```javascript
// ❌ SAI - Console.log không cấu trúc
console.log(error);
console.log('User:', user);
console.log('Processing order...');

// ✅ ĐÚNG - Structured logs
Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  console.log(JSON.stringify({
    level: 'info',
    requestId,
    timestamp: new Date().toISOString(),
    message: 'Processing order',
    userId: user?.id,
    orderId: order?.id
  }));
  
  try {
    // ... logic
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      requestId,
      timestamp: new Date().toISOString(),
      message: 'Order creation failed',
      error: error.message,
      stack: error.stack,
      userId: user?.id,
      context: { orderId, items: order?.items?.length }
    }));
    
    return Response.json({ 
      error: 'Không thể tạo đơn hàng' 
    }, { status: 500 });
  }
});
```

**Log Levels:**
- `info` - Normal operations
- `warn` - Warning, cần chú ý
- `error` - Lỗi cần xử lý
- `debug` - Debug info (tắt ở production)

**Log Fields:**
- `level` - Log level
- `timestamp` - ISO timestamp
- `requestId` - Unique request ID
- `message` - Human-readable message
- `userId` - User context
- `error` - Error message (nếu có)
- `stack` - Stack trace (error only)
- `context` - Additional context

**Lợi ích:**
- Debug production dễ dàng
- Trace request flow
- Phân tích lỗi nhanh
- Monitoring & alerting

---

## 9️⃣ Giới Hạn Data Response (No Overfetching)

**KHÔNG trả về field không cần thiết hoặc nhạy cảm:**

```javascript
// ❌ SAI - Trả toàn bộ user object
const user = await base44.entities.User.get(userId);
return Response.json(user); // Chứa password_hash, internal fields, etc.

// ✅ ĐÚNG - Whitelist fields cần thiết
const user = await base44.entities.User.get(userId);
const safeUser = {
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role
  // KHÔNG trả password, tokens, internal fields
};
return Response.json({ success: true, data: safeUser });
```

**KHÔNG được trả về:**
- ❌ Passwords (hashed hoặc plain)
- ❌ JWT tokens
- ❌ API keys
- ❌ Internal IDs (database auto-increment, etc.)
- ❌ System metadata (created_by_system, internal_status)
- ❌ Field không cần thiết cho client

**Nguyên tắc:**
- Client chỉ nhận đúng thứ nó cần
- Whitelist thay vì blacklist
- Dùng DTO cho response

---

## 🔟 Rate Limiting & Security (Nghĩ Từ Sớm)

**Security KHÔNG phải việc làm sau - nghĩ ngay từ đầu:**

```javascript
// ✅ ĐÚNG - Có rate limiting, auth check, input validation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const requestCounts = new Map(); // Simple in-memory rate limiter

Deno.serve(async (req) => {
  // 1. Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const count = requestCounts.get(ip) || 0;
  
  if (count > 100) { // 100 requests per window
    return Response.json({ 
      error: 'Too many requests' 
    }, { status: 429 });
  }
  requestCounts.set(ip, count + 1);
  
  // 2. Authentication
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ 
      error: 'Unauthorized' 
    }, { status: 401 });
  }
  
  // 3. Authorization (nếu cần)
  if (user.role !== 'admin') {
    return Response.json({ 
      error: 'Forbidden' 
    }, { status: 403 });
  }
  
  // 4. Input validation
  const body = await req.json();
  if (!body.name || body.name.length > 200) {
    return Response.json({ 
      error: 'Tên không hợp lệ' 
    }, { status: 400 });
  }
  
  // 5. Business logic
  const result = await processRequest(body, user);
  return Response.json({ success: true, data: result });
});
```

**Security Layers (Defense in Depth):**

```
┌────────────────────────────────────────┐
│ 1. Rate Limiting (chống spam/DDoS)    │
├────────────────────────────────────────┤
│ 2. Authentication (xác thực user)      │
├────────────────────────────────────────┤
│ 3. Authorization (kiểm tra quyền)      │
├────────────────────────────────────────┤
│ 4. Input Validation (chống injection)  │
├────────────────────────────────────────┤
│ 5. Business Logic (xử lý an toàn)      │
├────────────────────────────────────────┤
│ 6. Output Sanitization (không lộ data) │
└────────────────────────────────────────┘
```

---

## 1️⃣1️⃣ Webhook Security (Signature Validation)

**Webhook từ external provider PHẢI validate signature:**

```javascript
// ✅ ĐÚNG - Validate Stripe webhook signature
import Stripe from 'npm:stripe';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const STRIPE_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
  
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  try {
    // CRITICAL: Validate signature BEFORE processing
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_SECRET
    );
    
    // Process verified event
    if (event.type === 'payment_intent.succeeded') {
      const orderId = event.data.object.metadata.order_id;
      await base44.asServiceRole.entities.Order.update(orderId, { 
        payment_status: 'paid' 
      });
    }
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Invalid signature:', error);
    return Response.json({ 
      error: 'Invalid signature' 
    }, { status: 400 });
  }
});
```

**Webhook Best Practices:**
- ✅ Luôn validate signature từ provider
- ✅ Reject ngay nếu signature invalid
- ✅ Log failed attempts
- ✅ Use idempotency keys (chống duplicate processing)
- ❌ KHÔNG process webhook nếu chưa verify authenticity

**Provider-Specific:**
- Stripe: `stripe.webhooks.constructEventAsync()`
- PayPal: Verify IPN signature
- Custom webhooks: Shared secret + HMAC

---

## 1️⃣2️⃣ Admin-Only Functions (Auth Guard)

**Function chỉ cho admin PHẢI check role:**

```javascript
// ❌ SAI - Không check role
Deno.serve(async (req) => {
  const users = await base44.asServiceRole.entities.User.list(); // Nguy hiểm!
  return Response.json(users);
});

// ✅ ĐÚNG - Guard admin-only operations
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // CRITICAL: Check admin role
  if (user?.role !== 'admin') {
    return Response.json({ 
      error: 'Forbidden: Admin access required' 
    }, { status: 403 });
  }
  
  // Proceed with admin-only operation
  const users = await base44.asServiceRole.entities.User.list();
  return Response.json({ success: true, data: users });
});
```

**Áp dụng cho:**
- Scheduled tasks (cron jobs)
- Admin dashboard operations
- System maintenance functions
- Bulk operations
- Data exports

---

## 1️⃣3️⃣ Backend Function Structure Template

**Template chuẩn cho mọi backend function:**

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Function Name: createOrder
 * Purpose: Tạo đơn hàng mới
 * Auth: Required (user or admin)
 */
Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const base44 = createClientFromRequest(req);
  
  try {
    // === 1. AUTHENTICATION ===
    const user = await base44.auth.me();
    if (!user) {
      console.warn(JSON.stringify({
        level: 'warn',
        requestId,
        message: 'Unauthorized access attempt'
      }));
      return Response.json({ 
        error: 'Chưa đăng nhập' 
      }, { status: 401 });
    }
    
    // === 2. AUTHORIZATION (nếu admin-only) ===
    // Uncomment if admin-only
    // if (user.role !== 'admin') {
    //   return Response.json({ error: 'Forbidden' }, { status: 403 });
    // }
    
    // === 3. PARSE & VALIDATE INPUT ===
    const body = await req.json();
    
    // Map to DTO
    const dto = {
      customer_name: body.customer_name?.trim() || '',
      items: Array.isArray(body.items) ? body.items : [],
      total_amount: parseFloat(body.total_amount) || 0
    };
    
    // Validate
    if (!dto.customer_name) {
      return Response.json({ 
        error: 'Tên khách hàng không được trống' 
      }, { status: 400 });
    }
    if (dto.items.length === 0) {
      return Response.json({ 
        error: 'Đơn hàng phải có ít nhất 1 sản phẩm' 
      }, { status: 400 });
    }
    if (dto.total_amount <= 0) {
      return Response.json({ 
        error: 'Tổng tiền phải lớn hơn 0' 
      }, { status: 400 });
    }
    
    // === 4. BUSINESS LOGIC (call service) ===
    console.log(JSON.stringify({
      level: 'info',
      requestId,
      message: 'Creating order',
      userId: user.id,
      itemCount: dto.items.length
    }));
    
    const result = await orderService.createOrder(dto, user);
    
    if (!result.success) {
      return Response.json({ 
        error: result.message 
      }, { status: 400 });
    }
    
    // === 5. SUCCESS RESPONSE ===
    console.log(JSON.stringify({
      level: 'info',
      requestId,
      message: 'Order created successfully',
      orderId: result.data.id,
      userId: user.id
    }));
    
    return Response.json({ 
      success: true, 
      data: result.data 
    });
    
  } catch (error) {
    // === 6. ERROR HANDLING ===
    console.error(JSON.stringify({
      level: 'error',
      requestId,
      message: 'Order creation failed',
      error: error.message,
      stack: error.stack,
      userId: user?.id
    }));
    
    return Response.json({ 
      error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' 
    }, { status: 500 });
  }
});
```

---

## 1️⃣4️⃣ Response Format Consistency

**Mọi API response PHẢI có format nhất quán:**

```javascript
// ✅ ĐÚNG - Consistent response format

// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Message lỗi"
}

// Paginated
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

**Nguyên tắc:**
- Luôn có field `success` (boolean)
- Success → có `data`
- Error → có `error` (string message)
- Pagination → có `pagination` object
- KHÔNG thay đổi structure tùy tiện

---

## 1️⃣5️⃣ Async Operations Best Practices

**Xử lý async đúng cách, tránh race conditions:**

```javascript
// ❌ SAI - Race condition
const updateProduct = async (id, data) => {
  const product = await base44.entities.Product.get(id);
  product.stock_quantity -= data.quantity;
  await base44.entities.Product.update(id, product);
};

// ✅ ĐÚNG - Atomic update hoặc transaction
const updateProduct = async (id, quantity) => {
  // Option 1: Atomic operation
  await base44.entities.Product.update(id, {
    stock_quantity: { $decrement: quantity }
  });
  
  // Option 2: Lock-based (nếu cần)
  const lock = await acquireLock(`product:${id}`);
  try {
    const product = await base44.entities.Product.get(id);
    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    product.stock_quantity -= quantity;
    await base44.entities.Product.update(id, product);
  } finally {
    await releaseLock(lock);
  }
};
```

---

## 1️⃣6️⃣ Backend Rules Checklist

**Mọi backend function PHẢI đáp ứng:**

### Security:
```
□ Không expose lỗi nội bộ (stack trace, DB error)
□ Log chi tiết ở backend, trả message chung cho client
□ Validate input qua DTO - zero trust
□ Dùng HTTP-only cookies cho JWT (nếu có auth)
□ Không hardcode secrets - dùng Deno.env.get()
□ Admin-only function có check user.role === 'admin'
□ Webhook có validate signature (Stripe/PayPal/etc.)
□ Rate limiting cho public endpoints (nếu cần)
```

### Code Quality:
```
□ Trả đúng HTTP status codes (200, 400, 401, 403, 404, 500)
□ Tách business logic sang service/domain
□ Có structured logging với requestId
□ Try-catch cho async operations
□ Response format nhất quán: { success, data/error }
```

### Data Safety:
```
□ Không trả field nhạy cảm (password, token, internal IDs)
□ Whitelist response fields
□ Atomic operations cho updates quan trọng
□ Idempotency cho webhooks/critical operations
```

### General:
```
□ Function name rõ ràng (camelCase, no spaces)
□ Có comment mô tả purpose, auth requirements
□ Security mindset từ đầu (auth → authz → validate → sanitize)
□ Tested với valid + invalid inputs
```

---

## 1️⃣7️⃣ Common Backend Pitfalls & Fixes

### Pitfall 1: Tin tưởng user input
```javascript
// ❌ SAI
const email = body.email;
await sendEmail(email);

// ✅ ĐÚNG
const email = body.email?.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return Response.json({ error: 'Email không hợp lệ' }, { status: 400 });
}
```

### Pitfall 2: Không handle edge cases
```javascript
// ❌ SAI
const items = body.items;
items.forEach(item => { ... });

// ✅ ĐÚNG
const items = Array.isArray(body.items) ? body.items : [];
if (items.length === 0) {
  return Response.json({ error: 'Giỏ hàng trống' }, { status: 400 });
}
if (items.length > 100) {
  return Response.json({ error: 'Tối đa 100 sản phẩm' }, { status: 400 });
}
```

### Pitfall 3: Expose internal errors
```javascript
// ❌ SAI
catch (error) {
  return Response.json({ error: error.message }, { status: 500 });
}

// ✅ ĐÚNG
catch (error) {
  console.error('[Function]', error);
  return Response.json({ error: 'Lỗi hệ thống' }, { status: 500 });
}
```

### Pitfall 4: No logging
```javascript
// ❌ SAI
const result = await doSomething();
return Response.json(result);

// ✅ ĐÚNG
console.log(JSON.stringify({ level: 'info', message: 'Start', requestId }));
const result = await doSomething();
console.log(JSON.stringify({ level: 'info', message: 'Success', requestId }));
return Response.json(result);
```

---

## 📌 Quy Định Áp Dụng

**Backend Rules áp dụng cho:**
- ✅ API endpoints (functions/)
- ✅ Scheduled tasks (cron jobs)
- ✅ Webhooks (payment callbacks, notifications)
- ✅ Background workers
- ✅ Event consumers

**Mọi code backend mới PHẢI:**
- Tuân theo template structure
- Pass security checklist
- Có structured logging
- Validate input qua DTO
- Handle errors properly

---

> **Remember:**  
> Security is NOT an afterthought.  
> Log everything. Trust nothing. Validate everything.  
> Backend là lớp phòng thủ cuối cùng - phải vững chắc.