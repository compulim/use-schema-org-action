const HappyDOMEnvironment = require('@happy-dom/jest-environment').default;

class HappyDOMEnvironmentWithWritableStream extends HappyDOMEnvironment {
  /** @param {any} args */
  constructor(...args) {
    // @ts-ignore
    super(...args);

    // eslint-disable-next-line no-undef
    this.global.WritableStream = WritableStream;
  }
}

module.exports = HappyDOMEnvironmentWithWritableStream;
