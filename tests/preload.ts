// Polyfill for protobuf generated code issues in Bun
// google-protobuf generated code often expects 'proto' to be globally available or implicitly defined
// especially when using CommonJS/Closure style.

if (typeof globalThis.proto === 'undefined') {
    globalThis.proto = {};
}
