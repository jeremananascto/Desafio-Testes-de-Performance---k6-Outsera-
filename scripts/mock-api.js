const http = require('node:http');

const posts = Array.from({ length: 100 }, (_, i) => ({
  userId: 1,
  id: i + 1,
  title: `Post de teste ${i + 1}`,
  body: `Conteudo de teste ${i + 1}`
}));

let nextId = 101;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' && req.url === '/posts') {
    res.writeHead(200);
    return res.end(JSON.stringify(posts));
  }

  const match = req.url.match(/^\/posts\/(\d+)$/);

  if (req.method === 'GET' && match) {
    const post = posts.find(item => item.id === Number(match[1]));

    if (post) {
      res.writeHead(200);
      return res.end(JSON.stringify(post));
    }

    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Post nao encontrado' }));
  }

  if (req.method === 'POST' && req.url === '/posts') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        res.writeHead(201);
        res.end(JSON.stringify({ ...payload, id: nextId++ }));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'JSON invalido' }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Rota nao encontrada' }));
});

server.listen(3000, '127.0.0.1', () => {
  console.log('API de teste disponivel em http://127.0.0.1:3000');
});