const JSDOMEnvironment = require('jest-environment-jsdom').default;

class JSDOMEnvironmentWithWritableStream extends JSDOMEnvironment {
  /** @param {any} args */
  constructor(...args) {
    // @ts-ignore
    super(...args);

    this.global.WritableStream = WritableStream;
  }
}

module.exports = JSDOMEnvironmentWithWritableStream;
