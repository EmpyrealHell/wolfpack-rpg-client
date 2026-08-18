import { Type } from '@angular/core';

export type ClassSpy<T> = {
  [Method in keyof T]: jasmine.Spy;
};

export class TestUtils {
  static spyOnClass<T>(classType: Type<T>): ClassSpy<T> {
    const { prototype } = classType,
      methods = Object.getOwnPropertyNames(prototype)
        .map(name => [name, Object.getOwnPropertyDescriptor(prototype, name)])
        .filter(
          ([_name, descriptor]) =>
            (descriptor as PropertyDescriptor).value instanceof Function
        )
        .map(([name]) => name);
    return jasmine.createSpyObj(`spyFor${classType.name}`, [...methods]);
  }
}
