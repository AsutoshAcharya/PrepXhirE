import { Map } from "immutable";
import { ResponseStruct } from "../types/type";
import { Response } from "express";

class ResponseBuilder {
  private response: Map<
    keyof ResponseStruct,
    ResponseStruct[keyof ResponseStruct]
  >;

  constructor(defaults: Partial<ResponseStruct> = {}) {
    const base: ResponseStruct = {
      success: null,
      message: "",
      type: null,
      data: null,
      status: 200,
    };

    this.response = Map({ ...base, ...defaults });
  }

  public set<K extends keyof ResponseStruct>(
    key: K,
    value: ResponseStruct[K]
  ): this {
    this.response = this.response.set(key, value);
    return this;
  }

  public setMultiple(values: Partial<ResponseStruct>): this {
    this.response = this.response.merge(values) as typeof this.response;
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
      data: data ?? null,
      ...(type && { type: type }),
      status: status,
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
      ...(type && { type: type }),
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

  public build(): ResponseStruct {
    return this.response.toJS() as ResponseStruct;
  }

  public send(res: Response): Response {
    const built = this.build();
    return res.status(built.status).json(built);
  }
}

export default ResponseBuilder;
