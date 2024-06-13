export const apiUrl =
  process.env.NODE_ENV == "development"
    ? "localhost:8080"
    : "http://54.144.179.206/bball/";
