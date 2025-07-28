import { Dependencies } from "../../container";

export default class AuthService {
  private readonly userModel;
  constructor({ userModel }: Dependencies) {
    this.userModel = userModel;
  }
  public async logIn() {}
  public async register() {
    console.log("registered");
  }
}
