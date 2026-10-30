export default async function handler(req, res) {
  // 1. Mở CORS toàn quyền cho trình duyệt
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Tách và làm sạch URL
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    
    // Xóa tham số match nội bộ do Vercel sinh ra
    url.searchParams.delete('match');
    url.searchParams.delete('...path');
    url.searchParams.delete('path');

    // Lấy phần đường dẫn đằng sau /api
    let cleanPath = url.pathname.replace(/^\/api/, '');
    if (!cleanPath.startsWith('/v1beta')) {
      cleanPath = '/v1beta' + cleanPath;
    }

    // Ghép URL hoàn chỉnh gửi tới Google
    const targetUrl = `https://generativelanguage.googleapis.com${cleanPath}${url.search}`;

    // 3. Chuẩn bị Body
    const bodyData = req.method !== 'GET' && req.body
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined;

    // 4. Gửi sang Google từ IP máy chủ Mỹ
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyData,
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
