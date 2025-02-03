const HappyDOMEnvironment = require('@happy-dom/jest-environment').default;

class HappyDOMEnvironmentWithWritableStream extends HappyDOMEnvironment {
  /** @param {any} args */
  constructor(...args) {
    // @ts-ignore
    super(...args);

    this.global.WritableStream = WritableStream;
  }
}

module.exports = HappyDOMEnvironmentWithWritableStream;
