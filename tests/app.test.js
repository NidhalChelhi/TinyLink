const request = require("supertest");
const app = require("../src/app");

describe("TinyLink API", () => {
  // Health endpoint tests
  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.service).toBe("TinyLink");
      expect(res.body).toHaveProperty("uptime");
      expect(res.body).toHaveProperty("timestamp");
    });

    it("should include x-request-id header", async () => {
      const res = await request(app).get("/health");
      expect(res.headers).toHaveProperty("x-request-id");
    });
  });

  // Root endpoint tests
  describe("GET /", () => {
    it("should return service info", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe("TinyLink");
      expect(res.body.status).toBe("running");
      expect(res.body).toHaveProperty("endpoints");
    });
  });

  // URL shortening tests
  describe("POST /shorten", () => {
    it("should shorten a valid URL", async () => {
      const res = await request(app)
        .post("/shorten")
        .send({ url: "https://example.com" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("shortCode");
      expect(res.body).toHaveProperty("shortUrl");
      expect(res.body.originalUrl).toBe("https://example.com");
    });

    it("should reject invalid URL", async () => {
      const res = await request(app)
        .post("/shorten")
        .send({ url: "not-a-valid-url" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should reject empty body", async () => {
      const res = await request(app).post("/shorten").send({});

      expect(res.statusCode).toBe(400);
    });
  });

  // Redirect tests
  describe("GET /:shortCode", () => {
    let shortCode;

    beforeAll(async () => {
      const res = await request(app)
        .post("/shorten")
        .send({ url: "https://github.com" });
      shortCode = res.body.shortCode;
    });

    it("should redirect to original URL", async () => {
      const res = await request(app).get(`/${shortCode}`);
      expect(res.statusCode).toBe(301);
      expect(res.headers.location).toBe("https://github.com");
    });

    it("should return 400 for invalid short code format", async () => {
      const res = await request(app).get("/nonexistent123");
      expect(res.statusCode).toBe(400); // Invalid format (not 6 chars)
    });

    it("should return 404 for non-existent valid code", async () => {
      const res = await request(app).get("/zzzzzz");
      expect(res.statusCode).toBe(404);
    });
  });

  // Stats tests
  describe("GET /stats/:shortCode", () => {
    let shortCode;

    beforeAll(async () => {
      const res = await request(app)
        .post("/shorten")
        .send({ url: "https://nodejs.org" });
      shortCode = res.body.shortCode;
    });

    it("should return stats for valid short code", async () => {
      const res = await request(app).get(`/stats/${shortCode}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("clicks");
      expect(res.body).toHaveProperty("originalUrl");
      expect(res.body.shortCode).toBe(shortCode);
    });

    it("should return 400 for invalid short code format", async () => {
      const res = await request(app).get("/stats/nonexistent123");
      expect(res.statusCode).toBe(400); // Invalid format (not 6 chars)
    });

    it("should return 404 for non-existent valid code", async () => {
      const res = await request(app).get("/stats/zzzzzz");
      expect(res.statusCode).toBe(404);
    });
  });

  // Metrics endpoint tests
  describe("GET /metrics", () => {
    it("should return Prometheus metrics", async () => {
      const res = await request(app).get("/metrics");
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("http_request_duration_seconds");
    });
  });

  // 404 handler tests
  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/unknown/route");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Not Found");
    });
  });
});
