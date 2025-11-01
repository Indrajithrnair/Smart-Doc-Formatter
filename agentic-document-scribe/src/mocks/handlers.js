import { rest } from 'msw';

export const handlers = [
  // Document upload
  rest.post('http://127.0.0.1:8000/api/documents/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ job_id: 'mock-job-id', status: 'uploaded' })
    );
  }),

  // Document processing
  rest.post('http://127.0.0.1:8000/api/documents/process/:jobId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ status: 'processing', job_id: req.params.jobId })
    );
  }),

  // Document status
  rest.get('http://127.0.0.1:8000/api/documents/:jobId/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ status: 'completed', job_id: req.params.jobId, progress: 100 })
    );
  }),

  // Document download
  rest.get('http://127.0.0.1:8000/api/documents/:jobId/download/:type', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ url: `/mock/${req.params.type}/${req.params.jobId}` })
    );
  }),

  // Auth endpoints
  rest.get('http://127.0.0.1:8000/api/auth/verify-token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ valid: true })
    );
  }),
  rest.post('http://127.0.0.1:8000/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: 'mock-token', user: { name: 'Test User' } })
    );
  }),
  rest.post('http://127.0.0.1:8000/api/auth/signup', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: 'mock-token', user: { name: 'Test User' } })
    );
  }),
  rest.post('http://127.0.0.1:8000/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),
];