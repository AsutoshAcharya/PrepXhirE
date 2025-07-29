export type ResponseStruct = {
  success: boolean | null;
  message: string;
  type: string | null;
  data: any | null;
  status: number;
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };
