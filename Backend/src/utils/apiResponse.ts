import { Response } from 'express';

class ApiResponse<T> {
  constructor(
    public data: T | null,
    public message: string,
    public statusCode: number = 200,
    public success: boolean = true,
  ) {}

  send(res: Response) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export { ApiResponse };
