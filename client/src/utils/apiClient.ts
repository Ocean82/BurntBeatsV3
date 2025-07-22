class ApiClient {
  private csrfToken: string = '';

  async fetchCsrfToken(): Promise<void> {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  private sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const sanitizedOptions = { ...options };

    if (sanitizedOptions.body && typeof sanitizedOptions.body === 'string') {
      try {
        const bodyData = JSON.parse(sanitizedOptions.body);
        const sanitizedData = this.sanitizeInput(bodyData);
        sanitizedOptions.body = JSON.stringify(sanitizedData);
      } catch (error) {
        // Body is not JSON, keep as is
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': this.csrfToken,
      ...sanitizedOptions.headers,
    };

    return fetch(url, {
      ...sanitizedOptions,
      headers,
      credentials: 'include',
    });
  }

  async post(url: string, data: any): Promise<Response> {
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }

    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get(url: string): Promise<Response> {
    return this.request(url, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();