import App from "./app";

const appInstance = new App();

appInstance.run().catch((err) => {
  console.error("Failed to start the server:", err);
});
