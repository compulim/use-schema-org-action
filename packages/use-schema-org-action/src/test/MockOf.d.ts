export type MockOf<T extends (...args: any) => any> = jest.Mock<ReturnType<T>, Parameters<T>, ThisParameterType<T>>;
