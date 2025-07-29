import { Dependencies } from "../../container";
import { IUserDocument } from "../../models/user.model";
import { ServiceResult } from "../../types/type";
import { LoginDto, RegisterDto } from "./auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
type Result = Omit<IUserDocument, "password">;

export default class AuthService {
  private readonly userModel;

  constructor({ userModel }: Dependencies) {
    this.userModel = userModel;
  }

  public async logIn(
    loginDto: LoginDto
  ): Promise<ServiceResult<Result & { token: string }>> {
    try {
      const user = await this.userModel.findOne({ email: loginDto.email });
      if (!user)
        return {
          success: false,
          message: "User not found please register",
        };
      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        user.password
      );
      if (!passwordMatch)
        return {
          success: false,
          message: "Invalid password",
        };
      const token = jwt.sign(
        {
          id: user._id,
          name: user.fullName,
          role: user.role,
        },
        process.env.JWT as string,
        { expiresIn: "7d" }
      );

      const { password, ...userData } = user.toObject();

      return {
        success: true,
        data: {
          ...userData,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Sometbhing went wrong!",
      };
    }
  }

  public async register(
    registerDto: RegisterDto
  ): Promise<ServiceResult<Result>> {
    try {
      const count = await this.userModel.countDocuments({
        $or: [{ fullName: registerDto.fullName }, { email: registerDto.email }],
      });
      if (count > 0) {
        return {
          success: false,
          message: "User already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 15);
      const createdUser = await this.userModel.create({
        ...registerDto,
        password: hashedPassword,
      });
      const { password, ...restData } = createdUser.toObject();

      return {
        success: true,
        data: restData,
      };
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }
  }
}
