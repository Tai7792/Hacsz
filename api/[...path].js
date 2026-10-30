export default async function handler(req, res) {
  // 1. Mở toàn quyền CORS cho trình duyệt
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Xử lý kiểm tra preflight OPTIONS của trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Lấy đường dẫn API và tự động chuẩn hóa
    // Lấy phần đường dẫn đằng sau /api
    let cleanPath = req.url.replace(/^\/api(\/gemini)?/, '');

    // Tự động gắn /v1beta nếu đường dẫn chưa có
    if (!cleanPath.startsWith('/v1beta')) {
      cleanPath = '/v1beta' + cleanPath;
    }

    const targetUrl = `https://generativelanguage.googleapis.com${cleanPath}`;

    // 3. Chuẩn bị dữ liệu body
    const bodyData = req.method !== 'GET' && req.body
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined;

    // 4. Chuyển tiếp sang Google Gemini API (từ IP máy chủ Mỹ của Vercel)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyData,
    });

    const data = await response.json().catch(() => ({}));

    // 5. Trả kết quả về cho ứng dụng
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
