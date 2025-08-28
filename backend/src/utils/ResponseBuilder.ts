import { Response } from "express";
import { ResponseStruct } from "../types/type";

class ResponseBuilder {
  private response: ResponseStruct;

  constructor(defaults: Partial<ResponseStruct> = {}) {
    this.response = {
      success: null,
      message: "",
      type: null,
      data: null,
      status: 200,
      ...defaults,
    };
  }

  public set<K extends keyof ResponseStruct>(
    key: K,
    value: ResponseStruct[K]
  ): this {
    this.response[key] = value;
    return this;
  }

  public setMultiple(values: Partial<ResponseStruct>): this {
    Object.assign(this.response, values);
    return this;
  }

  public success({
    message = "Success",
    data = null,
    type = null,
    status = 200,
  }: Partial<
    Pick<ResponseStruct, "message" | "data" | "type" | "status">
  > = {}): this {
    return this.setMultiple({
      success: true,
      message,
      data,
      ...(type ? { type } : {}),
      status,
    });
  }

  public error({
    message = "Something went wrong",
    type = null,
    status = 500,
  }: Partial<Pick<ResponseStruct, "message" | "type" | "status">> = {}): this {
    return this.setMultiple({
      success: false,
      message,
      data: null,
      ...(type ? { type } : {}),
      status,
    });
  }

  public unauthorized(message = "Unauthorized"): this {
    return this.error({ message, status: 401 });
  }

  public badRequest(message = "Bad Request"): this {
    return this.error({ message, status: 400 });
  }

  public notFound(message = "Not Found"): this {
    return this.error({ message, status: 404 });
  }

  public conflict(message: string): this {
    return this.error({ message, status: 409 });
  }

  public serverError(message = "Internal Server Error"): this {
    return this.error({ message, status: 500 });
  }

  public customError({
    message = "Error",
    status = 500,
    type = null,
  }: Partial<Pick<ResponseStruct, "message" | "status" | "type">> = {}): this {
    return this.error({ message, status, type });
  }

  public tooManyRequests(
    message = "Too many requests, please try again later!"
  ) {
    return this.error({ message, status: 429 });
  }

  public build(): ResponseStruct {
    return this.response;
  }

  public send(res: Response): Response {
    const built = this.build();
    const { originalUrl, method } = res.req;
    const status = built.status;

    console.log(`[${method}] ${originalUrl} - ${status}`);
    return res.status(status).json(built);
  }
}

export default ResponseBuilder;
